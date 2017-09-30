import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuItem, DataTable, LazyLoadEvent } from "primeng/primeng";
import Dexie from 'dexie';
import { Observable } from "rxjs";
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
const MAX_EXAMPLE_RECORDS = 1000;

@Component({
  selector: 'at-alltimes',
  templateUrl: './alltimes.component.html',
  styleUrls: ['./alltimes.component.css']
})
export class AlltimesComponent implements OnInit {

  @ViewChild("dt") dt : DataTable;

  projectForm: FormGroup;
  
 
  allTimesheetData = [];
  
  allProjectNames = ['', 'Payroll App', 'Mobile App', 'Agile Times'];

  allProjects = this.allProjectNames.map((proj) => {
    return { label: proj, value: proj }
  });
  displayEditDialog = false;
  selectedRows: Array<any>;

  contextMenu: MenuItem[];

  recordCount : number;
  
  constructor(private apollo: Apollo, private fb:FormBuilder) { }

  ngOnInit() {
    this.projectForm=this.fb.group({
      User: ['', [Validators.required]],
      Project: ['', [Validators.required]],
      Category: ['', [Validators.required]],
      StartTime: ['', [Validators.required]],
      EndTime: ['', [Validators.required]]

    })
    const AllClientsQuery = gql`
        query allTimesheets {
          allTimesheets {
              id
              user
              project
              category
              startTime
              endTime
            }
        }`;  
 
  const queryObservable = this.apollo.watchQuery({

  query: AllClientsQuery

}).subscribe(({ data, loading }: any) => {

  this.allTimesheetData = data.allTimesheets;
  this.recordCount = data.allTimesheets.length;

});
  
}

onSubmit() {
  const user = this.projectForm.value.User;
  const project = this.projectForm.value.Project;
  const category = this.projectForm.value.Category;
  const startTime = this.projectForm.value.StartTime;
  const endTime = this.projectForm.value.EndTime;

  const createTimesheet = gql`
    mutation createTimesheet ($user: String!, $project: String!, $category: String!, $startTime: Int!, $endTime: Int!, $date: DateTime!) {
      createTimesheet(user: $user, project: $project, category: $category, startTime: $startTime, endTime: $endTime, date: $date ) {
        id
      }
    }
  `;

  this.apollo.mutate({
    mutation: createTimesheet,
    variables: {
      user: user,
      project: project,
      category: category,
      startTime: startTime,
      endTime: endTime,
      date: new Date()
    }
  }).subscribe(({ data }) => {
    console.log('got data', data);
    
  }, (error) => {
    console.log('there was an error sending the query', error);
  });
  this.displayEditDialog = false;
}

onEditComplete(editInfo) { }


}
