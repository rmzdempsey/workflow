import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-workflow-canvas',
  templateUrl: './workflow-canvas.component.html',
  styleUrls: ['./workflow-canvas.component.scss']
})
export class WorkflowCanvasComponent implements OnInit {

  constructor() { }

  tasks : Array<Task> = []

  selected : Task;
  selectedOffsetX: number;
  selectedOffsetY: number;

  newTask(){
    this.tasks.push(new Task(
      Math.random() * 100,
      Math.random() * 100,
      Math.random() * 100,
      Math.random() * 100,
    ))
  }

  ngOnInit() {
  }

  onMouseMove(evt:MouseEvent){
    if( this.selected && evt.buttons === 1 ){
      this.selected.x = this.selected.x + evt.movementX
      this.selected.y = this.selected.y + evt.movementY
    }
  }

  onMouseDown(evt:MouseEvent){
    this.tasks.forEach(t=>{
      if(t.containsPoint(evt.offsetX,evt.offsetY)){
        this.selected = t;
        this.selectedOffsetX = evt.offsetX - t.x;
        this.selectedOffsetY = evt.offsetY - t.y;
      }
    })
  }

  onMouseUp(evt:MouseEvent){
    this.selected = null;
  }

  onMouseEnter(evt:MouseEvent){
    if(this.selected){
      this.selected.x = this.selectedOffsetX + evt.offsetX;
      this.selected.y = this.selectedOffsetY + evt.offsetY
    }
  }

}

export class Task {
  
  constructor(public x:number, public y: number, public width: number, public height: number ){

  }

  containsPoint(x:number,y:number):boolean{
    return x >= this.x && x <= (this.x + this.width) && y >= this.y && y<(this.y+this.height)
  }
}
