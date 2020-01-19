import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { WorkflowCanvasComponent } from './workflow-canvas/workflow-canvas.component';
import { CommonModule } from '@angular/common';
import { WorkflowTaskComponent } from './workflow-canvas/workflow-task/workflow-task.component';
import { WorkflowTerminatorComponent } from './workflow-canvas/workflow-terminator/workflow-terminator.component';
import { WorkflowDecisionComponent } from './workflow-canvas/workflow-decision/workflow-decision.component';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [
    AppComponent,
    WorkflowCanvasComponent,
    WorkflowTaskComponent,
    WorkflowTerminatorComponent,
    WorkflowDecisionComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FlexLayoutModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
