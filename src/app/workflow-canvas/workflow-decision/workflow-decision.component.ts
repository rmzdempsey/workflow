import { Component, Input } from '@angular/core';
import { WorkflowCanvasComponent } from '../workflow-canvas.component';
import { DiamondWorkflowNode,Direction } from '../workflow.model';

@Component({
  selector: '[app-workflow-decision]',
  templateUrl: './workflow-decision.component.html',
  styleUrls: ['./workflow-decision.component.scss']
})
export class WorkflowDecisionComponent {

  @Input() node : DiamondWorkflowNode;
  @Input() canvas : WorkflowCanvasComponent;

  constructor() { }

  path() :string{
    const x0 = this.node.x;
    const y0 = this.node.y;
    const x = this.node.width/2;
    const y = this.node.height/2;
    return `M ${x0} ${y0-y} L ${x0+x} ${y0} L ${x0} ${y0+y} L ${x0-x} ${y0} L ${x0} ${y0-y}`
  }

}
