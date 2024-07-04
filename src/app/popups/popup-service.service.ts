import { ElementRef, Injectable, Renderer2 } from '@angular/core';
import { CreateSubjectService } from './create-subject/create-subject-service.service';
import { CreateDegreeService } from './create-degree/create-degree-service.service';
import { CreateGroupService } from './create-group/create-group-service.service';

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  constructor
  (private renderer: Renderer2,
    private el: ElementRef,
    public createSubjectService: CreateSubjectService,
    public createDegreeService: CreateDegreeService,
    public createGroupService: CreateGroupService,
  ) {}

    toggleWrapperContainerStyles(status: boolean): void {
      const wrapperContainer = this.el.nativeElement.querySelector('#wrapper-container');
      if (status) {
        this.renderer.setStyle(wrapperContainer, 'filter', 'blur(5px)');
        this.renderer.setStyle(wrapperContainer, 'pointer-events', 'none');
      } else if (!status) {
        this.renderer.setStyle(wrapperContainer, 'filter', 'none');
        this.renderer.setStyle(wrapperContainer, 'pointer-events', 'auto');
      }
    };

}
