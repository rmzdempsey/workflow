import { Component, Input } from '@angular/core';
import { WorkflowCanvasComponent } from '../workflow-canvas.component';
import { CircleWorkflowNode } from '../workflow.model';

@Component({
  selector: '[app-workflow-terminator]',
  templateUrl: './workflow-terminator.component.html',
  styleUrls: ['./workflow-terminator.component.scss']
})
export class WorkflowTerminatorComponent {

  @Input() node : CircleWorkflowNode;
  @Input() canvas : WorkflowCanvasComponent;

  constructor() { 
  }

}
