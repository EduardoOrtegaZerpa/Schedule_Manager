import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateGroupService } from './create-group-service.service';
import { AdminService } from '../../admin/admin.service';
import { Group, Subject } from '../../../interfaces';

@Component({
  selector: 'app-create-group',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.css', '../popup-common.css']
})
export class CreateGroupComponent implements OnInit{

  groupForm: FormGroup;
  subject: Subject | undefined;

  constructor(private fb: FormBuilder, private groupService: CreateGroupService, private adminService: AdminService) {
    this.groupForm = this.fb.group({
      groupName: ['', Validators.required],
      groupDetails: ['']
    });
  }

  ngOnInit() {
    this.subject = this.groupService.getSubject();
  }

  closePopup(): void {
    this.groupService.closeCreateGroupPopup();
  }

  createGroup(): void {

    if (!this.groupForm.valid) {
      return;
    }

    if (!this.subject || !this.subject.id) {
      return;
    }

    const group: Group = {
      name: this.groupForm.value.groupName,
      details: this.groupForm.value.groupDetails,
      subject_id: this.subject?.id,
      degree_id: this.subject?.degree_id
    }

    if (!this.subject) {
      return;
    }

    this.adminService.addGroup(group, this.subject.id).subscribe((res: Group) => {
      this.groupService.closeCreateGroupPopup();
      this.groupService.created.emit(res);
    });
  }

}
