import { Component, OnInit, HostListener, ElementRef, ChangeDetectorRef, ViewChild } from '@angular/core';
import * as $ from 'jquery';
declare var moment: any;
import { NgxDrpOptions, PresetItem, Range } from 'ngx-mat-daterange-picker';
import { RequestService } from '../service/request.service';
import { apiInfo, environment } from '../../environments/environment';

import 'datatables.net';
import 'datatables.net-dt';

import {ToastaService, ToastaConfig, ToastOptions, ToastData} from 'ngx-toasta';



@Component({
  selector: 'app-report-main',
  templateUrl: './report-main.component.html',
  styleUrls: ['./report-main.component.css']
})
export class ReportMainComponent implements OnInit {

  isShow = false;
  isProduct = false;
	isContains = false;
	searchFilter:any;
	primaryDimension:any = [];
	fields:any = [];
	range:Range = {fromDate:new Date(), toDate: new Date()};
  options:NgxDrpOptions;
  presets:Array<PresetItem> = [];

  dtOptions: any = {};
  drag:any = [];
  realTable:any = [];
  realTableFields:any = [];
  cntForSplit:any = 0;
  selectedIds:any = [];
  allFieldsData:any;
  realDataTable:any = [];

  selectedColumnSlug:any = [];
  selectedIdsFields:any = [];
  selectedColumnSlugFields:any = [];


  isShowTable:boolean = false;
  isShowTableFields:boolean = false;
  applyScroll:boolean = false;
  sampleArray:any = [];
  selectedDateCol:any;
  selectedDateColumnSlug:any;

  isGroupDone:boolean = false;
  groupedColName:any;
  groupedColumns:any=[];
  filterCondition:any=[];

  selectedCondiCol:any = [];
  selectedCondi:any = [];
  allColumns:any=[];
  conditionArr:any=[];
  conditionTemp = 0;
  showAddBtn:boolean=true;
  nextPage:boolean= false;
  currentPage:any = 1;
  limit:any = 20;
  showApplyBtn:boolean=false;
  searchTextArr:any=[];

  @ViewChild('dateRangePicker') dateRangePicker;


  // @ViewChild('wholeRightSection') wholeRightSection: ElementRef;
  // @ViewChild('leftSection') leftSection: ElementRef;
  // @ViewChild('rightSection') rightSection: ElementRef;


  constructor(
    private cdr:ChangeDetectorRef,
    public requestService:RequestService,
    private toastaService:ToastaService,
    private toastaConfig: ToastaConfig
    ) {
      this.toastaConfig.theme = 'bootstrap';
      this.toastaConfig.position= "top-right";
      this.sampleArray = [
        'company',
        'master product',
        'campaign',
        'promotion',
        'list',
        'order'
      ]
     }

  ngOnInit() {
    this.getColumns();
		const today = new Date();
		const fromMin = new Date(today.getFullYear(), today.getMonth()-2, 1);
		const fromMax = new Date(today.getFullYear(), today.getMonth()+1, 0);
		const toMin = new Date(today.getFullYear(), today.getMonth()-1, 1);
		const toMax = new Date(today.getFullYear(), today.getMonth()+2, 0);

		this.setupPresets();
    	this.options = {
			presets: this.presets,
			format: 'mediumDate',
			range: {fromDate:today, toDate: today},
			applyLabel: "Submit",
			calendarOverlayConfig: {
				shouldCloseOnBackdropClick: false,
				// hasBackDrop: false
			},
			cancelLabel: "Cancel",
			// excludeWeekends:true,
			fromMinMax: {fromDate:fromMin, toDate:fromMax},
			toMinMax: {fromDate:toMin, toDate:toMax}
		};

		this.dtOptions = {
			pagingType: 'full_numbers',
			fixedColumns:   {
				leftColumns: 2
			},
			colReorder: {
				order: [1, 0, 2, 3],
				// fixedColumnsLeft: 2
			}
		};

  }

  showFilters() {
    this.isShow = !this.isShow;
  }
  showProduct() {
    this.isProduct = !this.isProduct;
  }
  showContains() {
    console.log('this.selectedCondi', this.selectedCondi);
    this.isContains = !this.isContains;
	}

	searchCheckbox(event) {
		console.log('event',event);
	}

	// handler function that receives the updated date range object
  updateRange(range: Range){
    //console.log('range',range);
    this.range = range;
    let data = {
      page: this.currentPage,
      limit:this.limit,
      dateFilterSlug: this.selectedDateColumnSlug,
      startDate: new moment(range['fromDate']).format('MM/DD/YYYY'),
      endDate: new moment(range['toDate']).format('MM/DD/YYYY'),
      selectedColumnsSlug:this.selectedColumnSlug.concat(this.selectedColumnSlugFields),
    };
    console.log('data',data);
  }

	// helper function to create initial presets
  setupPresets() {

    const backDate = (numOfDays) => {
      const today = new Date();
      return new Date(today.setDate(today.getDate() - numOfDays));
    }

    const today = new Date();
    const yesterday = backDate(1);
    const minus7 = backDate(7)
    const minus30 = backDate(30);
    const currMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const currMonthEnd = new Date(today.getFullYear(), today.getMonth()+1, 0);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth()-1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    this.presets =  [
      {presetLabel: "Yesterday", range:{ fromDate:yesterday, toDate:today }},
      {presetLabel: "Last 7 Days", range:{ fromDate: minus7, toDate:today }},
      {presetLabel: "Last 30 Days", range:{ fromDate: minus30, toDate:today }},
      {presetLabel: "This Month", range:{ fromDate: currMonthStart, toDate:currMonthEnd }},
      {presetLabel: "Last Month", range:{ fromDate: lastMonthStart, toDate:lastMonthEnd }}
    ]
  }

  //For capturing the start of drag event in table
  dragStart(event,index) {
    console.log('comgin',event);
    console.log('index',index);
    console.log('this.realTable',this.realTable)
  }

  //For checking counter of loop in main table
  checkCounter(i) {
    this.cntForSplit = i;
    this.cdr.detectChanges();
  }

  //For calling column name API
  getColumns() {
    this.requestService.post(apiInfo.info.report,{}).then((res) => {
      console.log(res);

      this.allFieldsData = res["data"];
      this.primaryDimension = res["data"].dimensions[0];
      this.fields = res["data"].fields;

      // if(this.primaryDimension.length > 0) {
        this.allColumns = res["data"].dimensions.concat(res["data"].fields);
        console.log('allColumns',this.allColumns)
      // }

      this.selectedDateCol = this.allFieldsData.filter_date_columns[0]['ColumnName'];


    }).catch((err) => {
      console.log(err);
    });
  }

  //For calling column name API
  getColumnsData(fromWhere) {

    if(this.selectedIds.length <= 0) {
      // alert();
    //   var toastOptions:ToastOptions = {
    //     title: "Error",
    //     msg: "Please select atleast one column for searching!!",
    //     showClose: true,
    //     timeout: 5000,
    //     theme: 'default',
    //     onAdd: (toast:ToastData) => {
    //         console.log('Toast ' + toast.id + ' has been added!');
    //     },
    //     onRemove: function(toast:ToastData) {
    //         console.log('Toast ' + toast.id + ' has been removed!');
    //     }
    // };
    // this.toastaService.error(toastOptions);
      this.isShowTable = false;
    } else {

      if(fromWhere == 0) {
        let newIndex = 0;
        let currentItem = '';

        for(let i = 0 ; i<this.selectedIds.length ; i++) {
          currentItem = this.selectedIds[i].ColumnName.toLowerCase();
          if(this.sampleArray.indexOf(currentItem) != '-1') {
            //newIndex = this.sampleArray.indexOf(this.selectedIds[i].ColumnName);
            this.selectedIds[i].newIndex = this.sampleArray.indexOf(currentItem);
            // newArr.push(this.selectedIds[i]);
          }
        }
        this.selectedIds.sort(function(a, b){
          return a.newIndex-b.newIndex
        })
      }


      this.selectedColumnSlug = [];

      for(let i = 0; i < this.selectedIds.length ; i++) {

        this.selectedColumnSlug.push(this.selectedIds[i].ColumnSlug);
      }

      console.log('this.selectedIds',this.selectedIds);
      console.log('this.real',this.realTable);
      //debugger;
      let pageLimit = this.limit;
      let curPage = 0;

      if(fromWhere == 0) {
        if(this.realTable.length > 0) {
          if(this.realTable[0].data != undefined) {
            if(this.realTable[0].data.length > 0) {
              pageLimit = this.realTable[0].data.length;
            }
          }
        } else if(this.realTableFields.length > 0) {
          if(this.realTableFields[0].data != undefined) {
            if(this.realTableFields[0].data.length > 0) {
              pageLimit = this.realTableFields[0].data.length;
            }
          }
        }
        curPage = 1;
      } else {
        curPage = this.currentPage;
      }

      console.log('this.selectedCondiCol',this.selectedCondiCol);
      console.log('this.selectedCondi',this.selectedCondi);
      console.log('this.searchTextArr',this.searchTextArr);

      /**
       * filterSlug:[this.selectedCondiCol[mainIndex].ColumnSlug],
      filterKeyword:[this.selectedCondi[mainIndex].keyword],
      filterSearchKeyword:[this.searchTextArr[mainIndex]],
       */

      console.log('this.groupedColumns',this.groupedColumns);

      let topCondition = {};

      if(this.selectedCondiCol.length>0) {
        let result = this.selectedCondiCol.map(a => a.ColumnSlug);
        console.log('let result = objArray.map(a => a.foo);',result);
      }


      // debugger;
      let data = {
        // filterSlug : this.selectedColumnSlug,
        requestedViewSlug: this.selectedColumnSlug,
        selectedColumnsSlug:this.selectedColumnSlug.concat(this.selectedColumnSlugFields),
        page: curPage,
        limit:pageLimit
      };
      this.requestService.post(apiInfo.info.report_data,data).then((res) => {
        console.log(res);

        for(let j=0;j < this.selectedIds.length; j++) {
          // dataMain = [];
          if(this.selectedIds[j].data == undefined || fromWhere == 0 ) {
            this.selectedIds[j].data = [];
          }


          if(this.groupedColumns.length > 0) {
            let myArr = [];
            res["data"].filter((elem, index, self) => {
              //console.log('self',self);
              // console.log('elem',elem);
              // console.log('index',index);
              if(self.findIndex((t) => {
                return (t[this.groupedColumns[0]] === elem[this.groupedColumns[0]])
              }) === index){
                myArr.push(elem);
              }else{
                elem[this.groupedColumns[0]] = ''
                myArr.push(elem);
              }
            });

            console.log('myArr',myArr);
          }


          for(let i = 0 ; i < res["data"].length ; i++) {
            Object.keys(res["data"][i]).filter(keys => {

              if(this.selectedIds[j].ColumnSlug == keys){
                this.selectedIds[j].data.push({
                  desc:res["data"][i][keys]
                });
              }
            });
          }
        }


        this.realTable = this.selectedIds.slice(0);

        this.isShowTable = true;
        if(res["loadmore"] > 0) {
          this.nextPage = true;
          // if(fromWhere == 2) {
          //   this.currentPage++;
          // }

        }

        console.log('this.selectedIds after',this.selectedIds);
        console.log('realTable after',this.realTable);
        console.log('this.currentPage AFter',this.currentPage);

      }).catch((err) => {
        // alert();
        var toastOptions:ToastOptions = {
          title: "Error",
          msg: "Something went wrong!!",
          showClose: true,
          timeout: 5000,
          theme: 'default'
        };
        this.toastaService.error(toastOptions);
        this.isShowTable = false;
      });
    }

    if(this.selectedIdsFields.length <= 0) {
      // alert();
    //   var toastOptions:ToastOptions = {
    //     title: "Error",
    //     msg: "Please select atleast one column for searching!!",
    //     showClose: true,
    //     timeout: 5000,
    //     theme: 'default',
    //     onAdd: (toast:ToastData) => {
    //         console.log('Toast ' + toast.id + ' has been added!');
    //     },
    //     onRemove: function(toast:ToastData) {
    //         console.log('Toast ' + toast.id + ' has been removed!');
    //     }
    // };
    // this.toastaService.error(toastOptions);
    this.isShowTableFields = false;
    } else {

      let pageLimitFields = this.limit;
      let curPage = 0;


      if(fromWhere == 0) {
        if(this.realTableFields.length > 0) {
          if(this.realTableFields[0].data != undefined) {
            if(this.realTableFields[0].data.length > 0) {
              pageLimitFields = this.realTableFields[0].data.length;
            }
          }
        } else if(this.realTable.length > 0) {
          if(this.realTable[0].data != undefined) {
            if(this.realTable[0].data.length > 0) {
              pageLimitFields = this.realTable[0].data.length;
            }
          }
        }
        curPage = 1;
      } else {
        curPage = this.currentPage;
      }

      let data = {
        // filterSlug : this.selectedColumnSlugFields,
        selectedColumnsSlug:this.selectedColumnSlug.concat(this.selectedColumnSlugFields),
        page: curPage,
        limit:pageLimitFields
      };
      this.requestService.post(apiInfo.info.report_data,data).then((res) => {
        console.log(res);
        console.log('this.selectedIdsFields',this.selectedIdsFields);

        for(let j=0;j < this.selectedIdsFields.length; j++) {
          // dataMain = [];

          if(this.selectedIdsFields[j].data == undefined || fromWhere == 0 ) {
            this.selectedIdsFields[j].data = [];
          }
          for(let i = 0 ; i < res["data"].length ; i++) {
            Object.keys(res["data"][i]).filter(keys => {

              if(this.selectedIdsFields[j].ColumnSlug == keys){
                this.selectedIdsFields[j].data.push({
                  desc:res["data"][i][keys]
                });
              }
            });
          }
        }
        this.realTableFields = this.selectedIdsFields.slice(0);

        this.isShowTableFields = true;
        if(res["loadmore"] > 0) {
          this.nextPage = true;
          // if(fromWhere == 2) {
          //   this.currentPage++;
          // }
          // this.currentPage++;
        }
      }).catch((err) => {
        // alert();
        var toastOptions:ToastOptions = {
          title: "Error",
          msg: "Something went wrong!!",
          showClose: true,
          timeout: 5000,
          theme: 'default'
        };
        this.toastaService.error(toastOptions);
        this.isShowTableFields = false;
      });
    }

  }

  //For getting the selected checkbox from left side
  OnCheckboxSelect(id, event, fromWhere) {


    if(fromWhere == 'fields') { // when any fields is selected from left side
      this.applyScroll = true;
      if (event.target.checked === true) {
        this.selectedIdsFields.push(id);
        this.selectedColumnSlugFields.push(id.ColumnSlug);
      }
      if (event.target.checked === false) {
        this.selectedIdsFields = this.selectedIdsFields.filter((item) => item !== id);
        this.selectedColumnSlugFields = this.selectedColumnSlugFields.filter((item) => item !== id.ColumnSlug);
      }
    } else { // when any dimension is selected from left side


      // let indexOf = '';
      // indexOf = this.sampleArray.indexOf(id.ColumnName);
      // console.log('indexOf',indexOf);

      if (event.target.checked === true) {
        this.selectedIds.push(id);

        // this.selectedColumnSlug.splice(indexOf,0,id.ColumnSlug);
        // this.selectedColumnSlug.join();

        this.selectedColumnSlug.push(id.ColumnSlug);
      }
      if (event.target.checked === false) {
        this.selectedIds = this.selectedIds.filter((item) => item !== id);
        this.selectedColumnSlug = this.selectedColumnSlug.filter((item) => item !== id.ColumnSlug);
      }
    }

  }

  //For applying sorting functionality in table data
  sortData(direction, item, event, fromWhere) {
    let processArr = [];
    let processArrFields = [];

    console.log('this.currentPage',this.currentPage);

    processArr = this.realTable;
    processArrFields = this.realTableFields;

    let data = {
      // filterSlug : this.selectedColumnSlug,
      page: this.currentPage,
      limit:this.limit,
      orderBySlug:[item.ColumnSlug],
      orderByDirection:[direction],
      selectedColumnsSlug:this.selectedColumnSlug.concat(this.selectedColumnSlugFields),
    };
    this.requestService.post(apiInfo.info.report_data,data).then((res) => {
      console.log('res sorting',res);

      for(let j=0;j < processArr.length; j++) {
        // dataMain = [];
        processArr[j].data = [];
        for(let i = 0 ; i < res["data"].length ; i++) {
          Object.keys(res["data"][i]).filter(keys => {

            if(processArr[j].ColumnSlug == keys){
              processArr[j].data.push({
                desc:res["data"][i][keys]
              });
            }
          });
        }
      }

      for(let j=0;j < processArrFields.length; j++) {
        // dataMain = [];
        processArrFields[j].data = [];
        for(let i = 0 ; i < res["data"].length ; i++) {
          Object.keys(res["data"][i]).filter(keys => {

            if(processArrFields[j].ColumnSlug == keys){
              processArrFields[j].data.push({
                desc:res["data"][i][keys]
              });
            }
          });
        }
      }

      this.realTable = processArr;
      this.realTableFields = processArrFields

      // this.realTable = processArr;
    }).catch((err) => {
      // alert();
      var toastOptions:ToastOptions = {
        title: "Error",
        msg: "Something went wrong!!",
        showClose: true,
        timeout: 5000,
        theme: 'default'
      };
      this.toastaService.error(toastOptions);
    });
  }

  //For removing the column from table
  removeColumn(items, event, fromWhere) {
    console.log("items", items);
    console.log("event",event.target);

    // items.selected = false;

    if(fromWhere == 'dimension') {
      this.selectedIds = this.selectedIds.filter((item) => item !== items);
      this.selectedColumnSlug = this.selectedColumnSlug.filter((item) => item !== items.ColumnSlug);

      console.log('Selected Ids false', this.selectedIds);
      console.log('this.selectedColumnSlug false', this.selectedColumnSlug);
    } else {
      this.selectedIdsFields = this.selectedIdsFields.filter((item) => item !== items);
      this.selectedColumnSlugFields = this.selectedColumnSlugFields.filter((item) => item !== items.ColumnSlug);

      console.log('selectedIdsFields Ids false', this.selectedIdsFields);
      console.log('this.selectedColumnSlugFields false', this.selectedColumnSlugFields);
    }


    if(this.selectedIds.length > 0) {
      this.getColumnsData(1);
      this.isShowTable = true;
    } else {
      this.isShowTable = false;
      this.isShowTableFields = false;
    }

    if(this.selectedIdsFields.length > 0) {
      this.getColumnsData(1);
      this.isShowTableFields = true;
    } else {
      this.isShowTableFields = false;
    }

  }

  selectedDateFild(item) {
    console.log('item',item);
    this.selectedDateColumnSlug = item.ColumnSlug;
    this.selectedDateCol = item.ColumnName;
  }

  //For applying grouping on table data based on selected column
  groupData(item, event) {

    console.log('item',item);
    console.log('event',event.target);
    let processArr = [];
    let currentSlug = item['ColumnSlug'];
    processArr = this.selectedIds.slice(0);

    if(this.groupedColumns.indexOf(item.ColumnSlug) == '-1') {
      this.groupedColumns.push(currentSlug);
    }



    let data = {
      // filterSlug : this.selectedColumnSlug,
      page: this.currentPage,
      limit:this.limit,
      groupSlug:this.groupedColumns,
      // orderByDirection:[direction],
      selectedColumnsSlug:this.selectedColumnSlug.concat(this.selectedColumnSlugFields),
    };
    this.requestService.post(apiInfo.info.report_data,data).then((res) => {
      console.log(res);

      // this.isGroupDone = true;
      // this.groupedColName = item.ColumnName;
      console.log('this.groupedColName',this.groupedColName);
      let myArr = [];

    //  let myArr = res["data"].filter((elem, index, self) => self.findIndex(
    //     (t) => {
    //       return (t[currentSlug] === elem[currentSlug])
    //     }) === index)

      res["data"].filter((elem, index, self) => {
        //console.log('self',self);
        // console.log('elem',elem);
        // console.log('index',index);
        if(self.findIndex((t) => {
          return (t[currentSlug] === elem[currentSlug])
        }) === index){
          myArr.push(elem);
        }else{
          elem[currentSlug] = ''
          myArr.push(elem);
        }
      });

      console.log('myArraY',myArr);
      let myArr1:any = [];
      for (const x in Object.keys(myArr)) {
        myArr1.push({
          desc: myArr[x][currentSlug]
        })
      }

      for (const x in Object.keys(processArr)) {
        if (processArr[x]['ColumnSlug'] === currentSlug) {
          processArr[x]['data'] = myArr1;
        }
      }

      this.realTable = processArr;


      // this.realTable = processArr;
    }).catch((err) => {
      // alert();
      var toastOptions:ToastOptions = {
        title: "Error",
        msg: "Something went wrong!!",
        showClose: true,
        timeout: 5000,
        theme: 'default'
      };
      this.toastaService.error(toastOptions);
    });

  }

  //For applying un group on table data based on selected column
  unGroupData(item,event) {

    let processArr = [];
    let newGroupedArray = {
      groupSlug:[]
    };

    if(this.groupedColumns.length>0) {
      var index = this.groupedColumns.indexOf(item.ColumnSlug);
      if (index > -1) {
        this.groupedColumns.splice(index, 1);
        newGroupedArray.groupSlug=this.groupedColumns;
      }
    }

    processArr = this.selectedIds;
    let data = {
      // filterSlug : this.selectedColumnSlug,
      newGroupedArray,
      page: this.currentPage,
      limit:this.limit,
      selectedColumnsSlug:this.selectedColumnSlug.concat(this.selectedColumnSlugFields),
    };
    this.requestService.post(apiInfo.info.report_data,data).then((res) => {
      console.log(res);

      // this.groupedColName = '';

      for(let j=0;j < processArr.length; j++) {
        // dataMain = [];
        processArr[j].data = [];
        for(let i = 0 ; i < res["data"].length ; i++) {
          Object.keys(res["data"][i]).filter(keys => {

            if(processArr[j].ColumnSlug == keys){
              processArr[j].data.push({
                desc:res["data"][i][keys]
              });
            }
          });
        }
      }
      this.realTable = processArr;

    }).catch((err) => {
      // alert();
      var toastOptions:ToastOptions = {
        title: "Error",
        msg: "Something went wrong!!",
        showClose: true,
        timeout: 5000,
        theme: 'default'
      };
      this.toastaService.error(toastOptions);
    });

  }

  /**
   * For sending the selected filter from the top
   * @param item
   * @param mainIndex
   */
  OnRadioSelect(item,mainIndex) {

    //console.log('item',item);
    //console.log('mainIndex',mainIndex);
    //console.log('this.allFieldsData',this.allFieldsData);
    let matchedKey = '';
    var keys = Object.keys(this.allFieldsData.filter_conditions);

    keys.forEach(function(key) {
      if(key == item.DataType) {
        matchedKey =  key;
      }
    });

    this.selectedCondiCol[mainIndex] = item;
    //console.log('selectedCondiCol',this.selectedCondiCol);
    this.filterCondition = this.allFieldsData.filter_conditions[matchedKey];
    //console.log('this.filterCondition',this.filterCondition);
    this.selectedCondi[mainIndex] = this.filterCondition[0];
    //console.log('this.selectedCondi',this.selectedCondi);
  }

  /**
   * For selecting the filter condition from the top filters
   * @param item
   * @param event
   * @param mainIndex
   */
  OnRadioSelectCondition(item, event, mainIndex) {
    this.selectedCondi[mainIndex] = item;
    //console.log('this.selectedCondi',this.selectedCondi);
  }

  /**
   * For applying the added top filter to the table
   * @param mainIndex
   */
  applyFilter(mainIndex) {
    this.showAddBtn = true;
    this.conditionArr[mainIndex].isFilterAdded = true;
    //console.log('mainIndex',mainIndex);
    //console.log('this.selectedCondiCol',this.selectedCondiCol);
    //console.log('this.selectedCondi',this.selectedCondi);
    //console.log('this.searchTextArr',this.searchTextArr);

    let processArr = [];
    let processArrFields = [];

    processArr = this.realTable;
    processArrFields = this.realTableFields;

    let data = {
      page: this.currentPage,
      limit:this.limit,
      filterSlug:[this.selectedCondiCol[mainIndex].ColumnSlug],
      filterKeyword:[this.selectedCondi[mainIndex].keyword],
      filterSearchKeyword:[this.searchTextArr[mainIndex]],
      selectedColumnsSlug:this.selectedColumnSlug.concat(this.selectedColumnSlugFields),
    };
    this.requestService.post(apiInfo.info.report_data,data).then((res) => {
      console.log('res sorting',res);

      for(let j=0;j < processArr.length; j++) {
        // dataMain = [];
        processArr[j].data = [];
        for(let i = 0 ; i < res["data"].length ; i++) {
          Object.keys(res["data"][i]).filter(keys => {

            if(processArr[j].ColumnSlug == keys){
              processArr[j].data.push({
                desc:res["data"][i][keys]
              });
            }
          });
        }
      }

      for(let j=0;j < processArrFields.length; j++) {
        // dataMain = [];
        processArrFields[j].data = [];
        for(let i = 0 ; i < res["data"].length ; i++) {
          Object.keys(res["data"][i]).filter(keys => {

            if(processArrFields[j].ColumnSlug == keys){
              processArrFields[j].data.push({
                desc:res["data"][i][keys]
              });
            }
          });
        }
      }

      this.realTable = processArr;
      this.realTableFields = processArrFields

    }).catch((err) => {
      var toastOptions:ToastOptions = {
        title: "Error",
        msg: "Something went wrong!!",
        showClose: true,
        timeout: 5000,
        theme: 'default'
      };
      this.toastaService.error(toastOptions);
    });
  }

  /**
   * For adding top block on filter dynamically on (+) icon click
   */
  addCondition() {
    this.conditionTemp++;
    this.conditionArr.push({
      'index':this.conditionTemp,
      'isFilterAdded':false
    });
    this.showAddBtn = false;

    //console.log('allColumns',this.allColumns);
    this.selectedCondiCol.push(this.allColumns[0].data[0]);

    this.filterCondition = this.allFieldsData.filter_conditions[this.allColumns[0].data[0].DataType];
    //console.log('this.filterCondition',this.filterCondition);
    this.selectedCondi.push(this.filterCondition[0]);

    //console.log('this.selectedCondi NEW',this.selectedCondi);
  }

  /**
   * For Apply filter on column filter options
   * @param selectedColumn
   */
  onClickApplyFilter(selectedColumn){
    //console.log('onClickApplyFilter',selectedColumn);
    //console.log('showAddBtn',this.showAddBtn);
    if (!this.showAddBtn) {
      var index = this.conditionArr.findIndex(e => e.isFilterAdded === false);
      this.removeCondition(index);
    }

    this.showAddBtn = false;

    this.conditionTemp++;
    this.conditionArr.push({
      'index':this.conditionTemp,
      'isFilterAdded':false
    });

    this.selectedCondiCol.push(selectedColumn);

    let matchedKey = '';
    var keys = Object.keys(this.allFieldsData.filter_conditions);

    keys.forEach(function(key) {
      if(key == selectedColumn.DataType) {
        matchedKey =  key;
      }
    });

    this.filterCondition = this.allFieldsData.filter_conditions[matchedKey];
    this.selectedCondi.push(this.filterCondition[0]);
  }

  /**
   * On Edit Allready created filters
   * @param index
   */
  isEidtCondition(index){
    this.conditionArr[index].isFilterAdded = false;
  }

  /**
   * For remove filters
   * @param index
   */
  removeCondition(index) {
    this.showAddBtn = true;
    //console.log('index',index);
    this.conditionArr.splice(index, 1);
    this.selectedCondiCol.splice(index, 1);
    this.searchTextArr.splice(index, 1);
    //console.log('this.conditionArr',this.conditionArr);
    //console.log('this.selectedCondiCol',this.selectedCondiCol);
  }

  //For scrolling and lazyloading
  onScroll(event: any) {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        if (this.nextPage) {
          this.currentPage++;
          this.getColumnsData(2);
        }
    }
  }

}
