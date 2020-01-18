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
  resizingHit: ResizingHit;
  selectionStartX: number;
  selectionStartY: number;
  selectionEndX: number;
  selectionEndY: number;
  
  newTask(){
    this.addNode( new RectWorkflowNode(this,
      100,
      100,
      100,
      100,
    ))
  }

  newDecision(){
    this.addNode( new DiamondWorkflowNode(this,
      100,
      100,
      100,
      100,
    ))
  }

  newTerminator(){
    this.addNode( new CircleWorkflowNode(this,
      100,
      100,
      30,
    ))
  }

  addNode(n:WorkflowNode){
    this.nodes.forEach(n=>n.selected=false);
    this.nodes.push(n)
    n.selected = true
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
    this.resizingHit = null;

    let resizeHits:Array<WorkflowNode> = this.nodes.slice().reverse().filter(n=>n.containsPointResize(e.offsetX,e.offsetY))
    if(resizeHits.length>0){
      this.resizingHit = resizeHits[0].containsPointResize(e.offsetX,e.offsetY)
      return
    }

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
    this.resizingHit = null;
  }

  onPointerMove(e:PointerEvent){
    if( this.resizingHit ){
      this.resizingHit.node.resize(this.resizingHit.direction,e.movementX,e.movementY)
    }
    else if( this.isDragging ){
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
  static cirleContainsPoint(cx:number,cy:number,r:number,x:number,y:number):boolean{
    const dx = cx - x;
    const dy = cy - y;
    return r >= Math.hypot(dx,dy);
  }
}

export enum ResizeDirection {
  NOT_RESIZING="0",
  NORTH="N", NORTH_EAST="NE", EAST="E", SOUTH_EAST="SE", SOUTH="S", SOUTH_WEST="SW", WEST="W", NORTH_WEST="NW"
}

export class ResizingHit {
  constructor( public direction : ResizeDirection, public node: WorkflowNode ){}
}

export abstract class WorkflowNode {

  selected: boolean;

  constructor(public canvas: WorkflowCanvasComponent, public x:number, public y: number ){}

  abstract containsPointResize(x:number,y:number):ResizingHit
  abstract containsPoint(x:number,y:number):boolean
  abstract isInsideRect(x0:number,y0:number,x1:number,y1:number):boolean
  abstract resize(direction:ResizeDirection,dx:number,dy:number)
  
  isSelected():boolean{ return this.selected && !this.canvas.isSelecting; }
}

export class RectWorkflowNode extends WorkflowNode {

  constructor(canvas: WorkflowCanvasComponent, x:number, y: number, public width: number, public height: number ){
    super(canvas,x,y)
  }

  containsPoint(x:number,y:number):boolean{
    return x >= this.x && x <= (this.x + this.width) && y >= this.y && y<(this.y+this.height)
  }

  isInsideRect(x0:number,y0:number,x1:number,y1:number):boolean{
    let x: Array<number> = Utils.orderValues(x0,x1)
    let y: Array<number> = Utils.orderValues(y0,y1)
    return this.x >= x[0] && (this.x+this.width)<=x[1] && this.y >= y[0] && (this.y+this.height)<=y[1];
  }

  containsPointResize(x:number,y:number):ResizingHit{
    if(this.selected){
      if( Utils.cirleContainsPoint(this.x,this.y,5,x,y) ){
        return new ResizingHit(ResizeDirection.NORTH_WEST,this);
      }
      else if( Utils.cirleContainsPoint(this.x+(this.width/2),this.y,5,x,y) ){
        return new ResizingHit(ResizeDirection.NORTH,this);
      }
      else if( Utils.cirleContainsPoint(this.x+this.width,this.y,5,x,y) ){
        return new ResizingHit(ResizeDirection.NORTH_EAST,this);
      }
      else if( Utils.cirleContainsPoint(this.x+this.width,this.y+(this.height/2),5,x,y) ){
        return new ResizingHit(ResizeDirection.EAST,this);
      }
      else if( Utils.cirleContainsPoint(this.x+this.width,this.y+this.height,5,x,y) ){
        return new ResizingHit(ResizeDirection.SOUTH_EAST,this);
      }
      else if( Utils.cirleContainsPoint(this.x+(this.width/2),this.y+this.height,5,x,y) ){
        return new ResizingHit(ResizeDirection.SOUTH,this);
      }
      else if( Utils.cirleContainsPoint(this.x,this.y+this.height,5,x,y)){
        return new ResizingHit(ResizeDirection.SOUTH_WEST,this);
      }
      else if( Utils.cirleContainsPoint(this.x,this.y+(this.height/2),5,x,y) ){
        return new ResizingHit(ResizeDirection.WEST,this);
      }
    }
    return null;
  }

  resize(direction:ResizeDirection,dx:number,dy:number){
    switch(direction){
      case ResizeDirection.NORTH:
        this.y = this.y + dy;
        this.height = this.height - dy;
        break;
      case ResizeDirection.SOUTH:
        this.height = this.height + dy;
        break;
      case ResizeDirection.WEST:
        this.x = this.x + dx;
        this.width = this.width - dx;
        break;
      case ResizeDirection.EAST:
        this.width = this.width + dx;
        break;
      case ResizeDirection.NORTH_EAST:
        this.y = this.y + dy;
        this.height = this.height - dy;
        this.width = this.width + dx;
        break;
      case ResizeDirection.SOUTH_EAST:
        this.height = this.height + dy;
        this.width = this.width + dx;
        break;
      case ResizeDirection.NORTH_WEST:
        this.x = this.x + dx;
        this.width = this.width - dx;
        this.y = this.y + dy;
        this.height = this.height - dy;
        break;
      case ResizeDirection.SOUTH_WEST:
        this.x = this.x + dx;
        this.width = this.width - dx;
        this.height = this.height + dy;
        break;
    }
  }
}

export class CircleWorkflowNode extends WorkflowNode {

  constructor(canvas: WorkflowCanvasComponent, x:number, y: number, public radius: number ){
    super(canvas,x,y)
  }

  containsPoint(x:number,y:number):boolean{
    return Utils.cirleContainsPoint(this.x,this.y,this.radius,x,y)
  }

  isInsideRect(x0:number,y0:number,x1:number,y1:number):boolean{
    let x: Array<number> = Utils.orderValues(x0,x1)
    let y: Array<number> = Utils.orderValues(y0,y1)
    return x[0] <= (this.x-this.radius) && x[1] >= (this.x+this.radius) && y[0] <= (this.y-this.radius) && y[1] >= (this.y+this.radius)
  }

  containsPointResize(x:number,y:number):ResizingHit{
    if(this.selected){
      if( Utils.cirleContainsPoint(this.x+this.radius,this.y,5,x,y) ){
        return new ResizingHit(ResizeDirection.EAST,this);
      }
    }
    return null;
  }

  resize(direction:ResizeDirection,dx:number,dy:number){
    this.radius = this.radius + dx;
  }
}

export class DiamondWorkflowNode extends WorkflowNode {

  constructor(canvas: WorkflowCanvasComponent, x:number, y: number, public width: number, public height: number ){
    super(canvas, x,y)
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

  containsPointResize(x:number,y:number):ResizingHit{
    if(this.selected){
      if( Utils.cirleContainsPoint(this.x,this.y-(this.height/2),5,x,y) ){
        return new ResizingHit(ResizeDirection.NORTH,this);
      }
      else if( Utils.cirleContainsPoint(this.x+(this.width/2),this.y,5,x,y) ){
        return new ResizingHit(ResizeDirection.EAST,this);
      }
      else if( Utils.cirleContainsPoint(this.x,this.y+(this.height/2),5,x,y) ){
        return new ResizingHit(ResizeDirection.SOUTH,this);
      }
      else if( Utils.cirleContainsPoint(this.x-(this.width/2),this.y,5,x,y) ){
        return new ResizingHit(ResizeDirection.WEST,this);
      }
    }
    return null;
  }

  resize(direction:ResizeDirection,dx:number,dy:number){
    switch(direction){
      case ResizeDirection.NORTH:
        this.y = this.y + dy;
        this.height = this.height - dy;
        break;
      case ResizeDirection.SOUTH:
        this.height = this.height + dy;
        break;
      case ResizeDirection.WEST:
        this.x = this.x + dx;
        this.width = this.width - dx;
        break;
      case ResizeDirection.EAST:
        this.width = this.width + dx;
        break;
    }
  }
}
