import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-workflow-canvas',
  templateUrl: './workflow-canvas.component.html',
  styleUrls: ['./workflow-canvas.component.scss']
})
export class WorkflowCanvasComponent implements OnInit, AfterViewInit {

  constructor() { }

  nodes : Array<WorkflowNode> = []

  isSelecting: boolean;
  isDragging: boolean;
  selectionStartX: number;
  selectionStartY: number;
  selectionEndX: number;
  selectionEndY: number;
  
  newTask(){
    this.nodes.push(new RectWorkflowNode(
      Math.random() * 100,
      Math.random() * 100,
      Math.random() * 100,
      Math.random() * 100,
    ))
  }

  newDecision(){
    this.nodes.push(new DiamondWorkflowNode(
      100,
      100,
      100,
      100,
    ))
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

    let hit : WorkflowNode = this.nodes.slice().reverse().find(n=>n.containsPoint(e.offsetX,e.offsetY))

    if(!hit){
      this.nodes.forEach(n=>n.selected=false);
      this.isSelecting = true;
      this.selectionStartX = e.offsetX;
      this.selectionStartY = e.offsetY;
      this.selectionEndX = e.offsetX;
      this.selectionEndY = e.offsetY;
    }
    else{
      this.isDragging = true;
      if(!hit.selected){
        this.nodes.forEach(n=>n.selected=false);
        hit.selected = true;
      }
      hit.selected = true;
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
      this.nodes.filter(n=>n.selected)
      .forEach(n=>{
        n.x = n.x + e.movementX
        n.y = n.y + e.movementY
      })
    }
    else if( this.isSelecting ){
      this.selectionEndX = e.offsetX;
      this.selectionEndY = e.offsetY
      this.nodes.filter(n=> n.isInsideRect(this.selectionStartX, this.selectionStartY, e.offsetX,e.offsetY))
        .forEach(n=>n.selected=true)
        
    }
  }

  getSelectionStartX():number{
    if( this.selectionStartX<=this.selectionEndX) return this.selectionStartX;
    else return this.selectionEndX;
  }

  getSelectionStartY():number{
    if( this.selectionStartY<=this.selectionEndY) return this.selectionStartY;
    else return this.selectionEndY
  }

  getSelectionWidth():number{
    let x :Array<number>= Utils.orderValues(this.selectionStartX,this.selectionEndX)
    return Math.abs(x[1]-x[0]);
  }

  getSelectionHeight():number{
    let y :Array<number>= Utils.orderValues(this.selectionStartY,this.selectionEndY)
    return Math.abs(y[1]-y[0]);
  }
}

class Utils {
  static orderValues(n0:number,n1:number): Array<number>{
    if( n0>n1 ){
      let tmp = n0;
      n0=n1;
      n1=tmp;
    }
    return [n0,n1]
  }
}

export abstract class WorkflowNode {

  selected: boolean;

  constructor(public x:number, public y: number ){}

  abstract containsPoint(x:number,y:number):boolean
  abstract isInsideRect(x0:number,y0:number,x1:number,y1:number):boolean
}

export class RectWorkflowNode extends WorkflowNode {

  constructor(x:number, y: number, public width: number, public height: number ){
    super(x,y)
  }

  containsPoint(x:number,y:number):boolean{
    return x >= this.x && x <= (this.x + this.width) && y >= this.y && y<(this.y+this.height)
  }

  isInsideRect(x0:number,y0:number,x1:number,y1:number):boolean{
    let x: Array<number> = Utils.orderValues(x0,x1)
    let y: Array<number> = Utils.orderValues(y0,y1)
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
    let x: Array<number> = Utils.orderValues(x0,x1)
    let y: Array<number> = Utils.orderValues(y0,y1)
    return x[0] <= (this.x-this.radius) && x[1] >= (this.x+this.radius) && y[0] <= (this.y-this.radius) && y[1] >= (this.y+this.radius)
  }
}

export class DiamondWorkflowNode extends WorkflowNode {

  constructor(x:number, y: number, public width: number, public height: number ){
    super(x,y)
  }

  containsPoint(x:number,y:number):boolean{
    let b : boolean = false;

    let m = this.y/this.x;

    let Y = y-this.y
    let X = x-(this.x-(this.width/2))

    if( Y <= m*X ){
      X = x-this.x
      Y = y-(this.y-(this.height/2))
      if( Y >= m*X ){
        m = -m;
        Y = y-this.y
        X = x-(this.x-(this.width/2))
        if( Y >= m*X ){
          X = x-this.x
          Y = y-(this.y+(this.height/2))
          if( Y <= m*X ){
            b = true;
          }
        }
      }
    }

    return b;
  }

  isInsideRect(x0:number,y0:number,x1:number,y1:number):boolean{
    let x: Array<number> = Utils.orderValues(x0,x1)
    let y: Array<number> = Utils.orderValues(y0,y1)
    let X = this.x-(this.width/2)
    let Y = this.y-(this.height/2)
    return X >= x[0] && (X+this.width)<=x[1] && Y >= y[0] && (Y+this.height)<=y[1];
  }
}
