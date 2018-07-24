import {TestBed} from '@angular/core/testing';
import {PlxModalBackdrop} from './modal-backdrop';

describe('plx-modal-backdrop', () => {

    beforeEach(() => {
        TestBed.configureTestingModule({declarations: [PlxModalBackdrop]});
    });

    it('should render backdrop with required CSS classes', () => {
        const fixture = TestBed.createComponent(PlxModalBackdrop);

        fixture.detectChanges();
        expect(fixture.nativeElement).toHaveCssClass('modal-backdrop');
    });
});
