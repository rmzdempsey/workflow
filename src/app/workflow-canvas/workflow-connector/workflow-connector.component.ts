import { Component, Input} from '@angular/core';
import { WorkflowCanvasComponent } from '../workflow-canvas.component';
import { WorkflowEdge } from '../workflow.model';

@Component({
  selector: '[app-workflow-connector]',
  templateUrl: './workflow-connector.component.html',
  styleUrls: ['./workflow-connector.component.scss']
})
export class WorkflowConnectorComponent{

  @Input() edge : WorkflowEdge;
  @Input() canvas : WorkflowCanvasComponent;

  constructor() { }

  path() :string{
    let source = this.canvas.model.nodes.find(n=>n.id == this.edge.sourceId)
    let x0 = source.getX(this.edge.sourceDirection);
    let y0 = source.getY(this.edge.sourceDirection);

    let p = `M ${x0} ${y0}`

    this.edge.junctions.forEach(j=>p = p + ` L ${j.x} ${j.y}`);

    if( this.edge.targetId != -1 ){
      let target = this.canvas.model.nodes.find(n=>n.id == this.edge.targetId)
      let x1 = target.getX(this.edge.targetDirection);
      let y1 = target.getY(this.edge.targetDirection);
      p = p + ` L ${x1} ${y1}`
    }

    // let target = this.canvas.model.nodes.find(n=>n.id == this.edge.targetId)
    // let x0 = source.getX(this.edge.sourceDirection);
    // let y0 = source.getY(this.edge.sourceDirection);
    // let x1 = target.getX(this.edge.targetDirection);
    // let y1 = target.getY(this.edge.targetDirection);
    //return `M ${x0} ${y0} L ${x1} ${y1}`

    return p;
  }
}
