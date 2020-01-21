import { Component, Input } from '@angular/core';
import { WorkflowCanvasComponent } from '../workflow-canvas.component';
import { RectWorkflowNode } from '../workflow.model';

@Component({
  selector: '[app-workflow-task]',
  templateUrl: './workflow-task.component.html',
  styleUrls: ['./workflow-task.component.scss']
})
export class WorkflowTaskComponent {

  @Input() node : RectWorkflowNode;
  @Input() canvas : WorkflowCanvasComponent;

  constructor() { 
  }
}
