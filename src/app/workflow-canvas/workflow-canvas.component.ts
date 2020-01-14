import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-workflow-canvas',
  templateUrl: './workflow-canvas.component.html',
  styleUrls: ['./workflow-canvas.component.scss']
})
export class WorkflowCanvasComponent implements OnInit, AfterViewInit {

  constructor() { }

  tasks : Array<Task> = []

  selection : Array<Task> = []

  isSelecting: boolean;
  isDragging: boolean;
  selectionStartX: number;
  selectionStartY: number;
  
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

  @HostListener("window:resize", [])
  private onResize() {
    this.detectScreenSize();
  }

  ngAfterViewInit() {
    this.detectScreenSize();
  }

  private detectScreenSize() {
    // we will write this logic later
  }

  onPointerDown(e:PointerEvent){
    this.isSelecting = false;
    this.isDragging = false;

    let hit : Task;
    this.tasks.slice().reverse().forEach(t=>{
      if( !hit && t.containsPoint(e.offsetX,e.offsetY)){
        hit = t;
      }
    })

    if(!hit){
      this.isSelecting = true;
      this.selection = [];
      this.selectionStartX = e.offsetX;
      this.selectionStartY = e.offsetY;
    }
    else{
      this.isDragging = true;
      if(this.selection.indexOf(hit)==-1){
        this.selection = [];
        this.selection.push(hit)
      }
      e.srcElement.setPointerCapture(e.pointerId);
    }
  }

  onPointerUp(e:PointerEvent){
    if( this.isDragging ){
      e.srcElement.releasePointerCapture(e.pointerId);
    }
    this.isDragging = false;
    this.isSelecting = false;
  }

  onPointerMove(e:PointerEvent){
    if( this.isDragging ){
      this.selection.forEach(t=>{
        t.x = t.x + e.movementX
        t.y = t.y + e.movementY
      })
    }
    else if( this.isSelecting ){
      this.tasks.forEach(t=>{
        if(this.selection.indexOf(t)==-1){
          if( t.isInsideRect(this.selectionStartX, this.selectionStartY, e.offsetX,e.offsetY)){
            this.selection.push(t)
          }
        }
      })
    }
  }
}

export class Task {
  
  constructor(public x:number, public y: number, public width: number, public height: number ){

  }

  containsPoint(x:number,y:number):boolean{
    return x >= this.x && x <= (this.x + this.width) && y >= this.y && y<(this.y+this.height)
  }

  isInsideRect(x0:number,y0:number,x1:number,y1:number):boolean{
    if( x0>x1 ){
      let tmp = x0;
      x0=x1;
      x1=tmp;
    }
    if( y0>y1 ){
      let tmp = y0;
      y0=y1;
      y1=tmp;
    }
    return this.x >= x0 && (this.x+this.width)<=x1 && this.y >= y0 && (this.y+this.height)<=y1;
  }


}
