import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AngularFontAwesomeModule } from 'angular-font-awesome';

import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterPipe } from './pipe/filter.pipe';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { NgxMatDrpModule } from 'ngx-mat-daterange-picker';
import { DataTablesModule } from 'angular-datatables';

import { NgDragDropModule } from 'ng-drag-drop';
import {DndModule} from 'ng2-dnd';

import { HttpModule } from '@angular/http';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import {ToastaModule} from 'ngx-toasta';
import { NgHttpLoaderModule } from 'ng-http-loader';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { MyAutofocusDirective } from './directive/my-autofocus.directive';


// import { ReportMainComponent } from './pages/report-main/report-main.component';

@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
    FilterPipe,
    MyAutofocusDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    NgxMatDrpModule,
    DataTablesModule,
    NgDragDropModule.forRoot(),
    DndModule.forRoot(),
    HttpModule,
    HttpClientModule,
    ToastaModule.forRoot(),
    NgHttpLoaderModule,
    NgbModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
