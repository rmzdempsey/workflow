import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-workflow-canvas',
  templateUrl: './workflow-canvas.component.html',
  styleUrls: ['./workflow-canvas.component.scss']
})
export class WorkflowCanvasComponent implements OnInit, AfterViewInit {

  constructor() { }

  nodes : Array<WorkflowNode> = []

  selection : Array<WorkflowNode> = []

  isSelecting: boolean;
  isDragging: boolean;
  selectionStartX: number;
  selectionStartY: number;
  
  newTask(){
    this.nodes.push(new RectWorkflowNode(
      Math.random() * 100,
      Math.random() * 100,
      Math.random() * 100,
      Math.random() * 100,
    ))
  }

  newDecision(){
    
  }

  newTerminator(){
    this.nodes.push(new CircleWorkflowNode(
      Math.random() * 100,
      Math.random() * 100,
      Math.random() * 100
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

    let hit : WorkflowNode;
    this.nodes.slice().reverse().forEach(n=>{
      if( !hit && n.containsPoint(e.offsetX,e.offsetY)){
        hit = n;
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
      this.selection.forEach(n=>{
        n.x = n.x + e.movementX
        n.y = n.y + e.movementY
      })
    }
    else if( this.isSelecting ){
      this.nodes.forEach(n=>{
        if(this.selection.indexOf(n)==-1){
          if( n.isInsideRect(this.selectionStartX, this.selectionStartY, e.offsetX,e.offsetY)){
            this.selection.push(n)
          }
        }
      })
    }
  }
}

export abstract class WorkflowNode {

  constructor(public x:number, public y: number ){}

  abstract containsPoint(x:number,y:number):boolean
  abstract isInsideRect(x0:number,y0:number,x1:number,y1:number):boolean

  orderValues(n0:number,n1:number): Array<number>{
    if( n0>n1 ){
      let tmp = n0;
      n0=n1;
      n1=tmp;
    }
    return [n0,n1]
  }
}

export class RectWorkflowNode extends WorkflowNode {

  constructor(x:number, y: number, public width: number, public height: number ){
    super(x,y)
  }

  containsPoint(x:number,y:number):boolean{
    return x >= this.x && x <= (this.x + this.width) && y >= this.y && y<(this.y+this.height)
  }

  isInsideRect(x0:number,y0:number,x1:number,y1:number):boolean{
    let x: Array<number> = this.orderValues(x0,x1)
    let y: Array<number> = this.orderValues(y0,y1)
    return this.x >= x[0] && (this.x+this.width)<=x[1] && this.y >= y[0] && (this.y+this.height)<=y[1];
  }
}

export class CircleWorkflowNode extends WorkflowNode {

  constructor(x:number, y: number, public radius: number ){
    super(x,y)
  }

  containsPoint(x:number,y:number):boolean{
    const dx = this.x - x;
    const dy = this.y - y;
    return this.radius >= Math.hypot(dx,dy);
  }

  isInsideRect(x0:number,y0:number,x1:number,y1:number):boolean{
    let x: Array<number> = this.orderValues(x0,x1)
    let y: Array<number> = this.orderValues(y0,y1)
    return x[0] <= (this.x-this.radius) && x[1] >= (this.x+this.radius) && y[0] <= (this.y-this.radius) && y[1] >= (this.y+this.radius)
  }
}
