import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { WorkflowCanvasComponent } from './workflow-canvas/workflow-canvas.component';
import { CommonModule } from '@angular/common';
import { WorkflowTaskComponent } from './workflow-canvas/workflow-task/workflow-task.component';
import { WorkflowTerminatorComponent } from './workflow-canvas/workflow-terminator/workflow-terminator.component';
import { WorkflowDecisionComponent } from './workflow-canvas/workflow-decision/workflow-decision.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { WorkflowConnectorComponent } from './workflow-canvas/workflow-connector/workflow-connector.component';
import { WorkflowModule } from './workflow-canvas/workflow.module';

@NgModule({
  declarations: [
    AppComponent,
    WorkflowTaskComponent,
    WorkflowTerminatorComponent,
    WorkflowDecisionComponent,
    WorkflowConnectorComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FlexLayoutModule,
    WorkflowModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
