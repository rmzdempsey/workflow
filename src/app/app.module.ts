import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { WorkflowCanvasComponent } from './workflow-canvas/workflow-canvas.component';
import { NodeComponent } from './workflow-canvas/node/node.component';
import { CommonModule } from '@angular/common';
import { WorkflowTaskComponent } from './workflow-canvas/workflow-task/workflow-task.component';
import { WorkflowTerminatorComponent } from './workflow-canvas/workflow-terminator/workflow-terminator.component';

@NgModule({
  declarations: [
    AppComponent,
    WorkflowCanvasComponent,
    NodeComponent,
    WorkflowTaskComponent,
    WorkflowTerminatorComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
