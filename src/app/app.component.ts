import { Component, ViewChild } from '@angular/core';
import { WorkflowCanvasComponent } from './workflow-canvas/workflow-canvas.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('canvas') canvas : WorkflowCanvasComponent;
}


