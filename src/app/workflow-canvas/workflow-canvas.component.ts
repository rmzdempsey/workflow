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

  onPointerDown(e:PointerEvent){
    this.tasks.forEach(t=>{
      if(t.containsPoint(e.offsetX,e.offsetY)){
        e.srcElement.setPointerCapture(e.pointerId);
        this.selected = t;
      }
    })
  }

  onPointerUp(e:PointerEvent){
    if(this.selected){
      this.selected = null;
      e.srcElement.releasePointerCapture(e.pointerId);
    }
  }

  onPointerMove(e:PointerEvent){
    if( this.selected && e.buttons === 1 ){
      this.selected.x = this.selected.x + e.movementX
      this.selected.y = this.selected.y + e.movementY
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
