import { Component, OnInit, Input } from '@angular/core';
import { RectWorkflowNode } from '../workflow-canvas.component';

@Component({
  selector: '[app-workflow-task]',
  templateUrl: './workflow-task.component.html',
  styleUrls: ['./workflow-task.component.scss']
})
export class WorkflowTaskComponent {

  @Input() node : RectWorkflowNode;

  constructor() { 
  }
}
