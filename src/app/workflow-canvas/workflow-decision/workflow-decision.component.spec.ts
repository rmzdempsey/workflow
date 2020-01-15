import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowDecisionComponent } from './workflow-decision.component';

describe('WorkflowDecisionComponent', () => {
  let component: WorkflowDecisionComponent;
  let fixture: ComponentFixture<WorkflowDecisionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkflowDecisionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowDecisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
