import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowConnectorComponent } from './workflow-connector.component';

describe('WorkflowConnectorComponent', () => {
  let component: WorkflowConnectorComponent;
  let fixture: ComponentFixture<WorkflowConnectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkflowConnectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowConnectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
