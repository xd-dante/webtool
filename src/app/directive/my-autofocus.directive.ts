import { Directive, OnInit, ElementRef } from '@angular/core';

@Directive({
  selector: '[appMyAutofocus]'
})
export class MyAutofocusDirective implements OnInit {

  constructor(private elementRef: ElementRef) { };

  ngOnInit(): void {
    this.elementRef.nativeElement.focus();
  }

}
