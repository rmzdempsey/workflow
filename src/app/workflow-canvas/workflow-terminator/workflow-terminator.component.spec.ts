import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowTerminatorComponent } from './workflow-terminator.component';

describe('WorkflowTerminatorComponent', () => {
  let component: WorkflowTerminatorComponent;
  let fixture: ComponentFixture<WorkflowTerminatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkflowTerminatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowTerminatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
