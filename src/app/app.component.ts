import { AfterViewInit, Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { AuthService } from './auth/auth.service';
import { CreateDegreeComponent } from './popups/create-degree/create-degree.component';
import { CreateSubjectComponent } from './popups/create-subject/create-subject.component';
import { CreateGroupComponent } from './popups/create-group/create-group.component';
import { PopupService } from './popups/popup-service.service';
import { CommonModule } from '@angular/common';
import { LoadingService } from './loading/loading.service';
import { LoadingComponent } from './loading/loading.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    RouterModule, 
    RouterLink, 
    RouterLinkActive, 
    HeaderComponent, 
    CreateDegreeComponent, 
    CreateSubjectComponent, 
    CreateGroupComponent,
    LoadingComponent,
    CommonModule
  ],
  providers: [PopupService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Scheduler';
  isLoaderVisible: boolean = false;

  constructor(
    private authService: AuthService,
    public loadingService: LoadingService,
    protected popupService: PopupService) {}

  ngOnInit() {
    this.authService.validateToken().subscribe();

    this.popupService.createDegreeService.isOpen$.subscribe((status: boolean) => {
      this.popupService.toggleWrapperContainerStyles(status);
    });

    this.popupService.createSubjectService.isOpen$.subscribe((status: boolean) => {
      this.popupService.toggleWrapperContainerStyles(status);
    });

    this.popupService.createGroupService.isOpen$.subscribe((status: boolean) => {
      this.popupService.toggleWrapperContainerStyles(status);
    });
  }

  ngAfterViewInit() {
    this.loadingService.isLoading$().subscribe((status: boolean) => {
      this.isLoaderVisible = status;
    });
  }

}
