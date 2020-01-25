import { NgModule } from '@angular/core';
import { WorkflowCanvasComponent } from './workflow-canvas.component';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { WorkflowTaskComponent } from './workflow-task/workflow-task.component';
import { WorkflowDecisionComponent } from './workflow-decision/workflow-decision.component';
import { WorkflowTerminatorComponent } from './workflow-terminator/workflow-terminator.component';
import { WorkflowConnectorComponent } from './workflow-connector/workflow-connector.component';

@NgModule({
declarations: [
    WorkflowCanvasComponent,
    WorkflowTaskComponent,
    WorkflowDecisionComponent,
    WorkflowTerminatorComponent,
    WorkflowConnectorComponent,
],
exports: [
    WorkflowCanvasComponent
],
imports: [
    CommonModule,
    BrowserModule,
],
providers: [],
})
export class WorkflowModule { }