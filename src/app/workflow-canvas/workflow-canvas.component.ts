import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-workflow-canvas',
  templateUrl: './workflow-canvas.component.html',
  styleUrls: ['./workflow-canvas.component.scss']
})
export class WorkflowCanvasComponent implements OnInit, AfterViewInit {

  constructor() { }

  nodes : Array<WorkflowNode> = []
  edges : Array<WorkflowEdge> = []

  isSelecting: boolean;
  isDragging: boolean;
  isConnecting: boolean;
  resizeHit: DirectionalHit;
  sourceHit: DirectionalHit;
  targetHit: DirectionalHit;
  selectionStartX: number;
  selectionStartY: number;
  selectionEndX: number;
  selectionEndY: number;
  connectingX: number;
  connectingY: number;
  
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
    this.resizeHit = null;

    if(this.sourceHit){
      this.isConnecting=true;
      this.connectingX=this.sourceHit.x;
      this.connectingY=this.sourceHit.y;
      return
    }

    let resizeHits:Array<WorkflowNode> = this.nodes.slice().reverse().filter(n=>n.containsPointResize(e.offsetX,e.offsetY))
    if(resizeHits.length>0){
      this.resizeHit = resizeHits[0].containsPointResize(e.offsetX,e.offsetY)
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
    if( this.sourceHit && this.targetHit ){
      this.edges.push(new WorkflowEdge(this.sourceHit,this.targetHit))
    }
    else if( this.isDragging ){
      e.srcElement.releasePointerCapture(e.pointerId);
    }
    this.isDragging = false;
    this.isSelecting = false;
    this.isConnecting = false;
    this.resizeHit = null;
    this.sourceHit=null;
    this.targetHit=null;
  }

  onPointerMove(e:PointerEvent){
    this.targetHit = null;
    if(this.isConnecting){
      this.connectingX=e.offsetX;
      this.connectingY=e.offsetY;
      let targetHits:Array<WorkflowNode> = this.nodes.slice().reverse().filter(n=>n.containsPointConnection(e.offsetX,e.offsetY)).filter(n=>n!=this.sourceHit.node)
      if(targetHits.length>0){
        this.targetHit = targetHits[0].containsPointConnection(e.offsetX,e.offsetY);
        return
      }
      return;
    }
    this.sourceHit = null;
    if( this.resizeHit ){
      this.resizeHit.node.resize(this.resizeHit.direction,e.movementX,e.movementY)
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
    else{
      let sourceHits:Array<WorkflowNode> = this.nodes.slice().reverse().filter(n=>n.containsPointConnection(e.offsetX,e.offsetY)).filter(n=>!n.selected)
      if(sourceHits.length>0){
        this.sourceHit = sourceHits[0].containsPointConnection(e.offsetX,e.offsetY);
        return
      }
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

  connectionPath():string{
    return `M ${this.sourceHit.x} ${this.sourceHit.y} L ${this.connectingX} ${this.connectingY}`
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

export enum Direction {
  UNKNOWN="0",
  NORTH="N", NORTH_EAST="NE", EAST="E", SOUTH_EAST="SE", SOUTH="S", SOUTH_WEST="SW", WEST="W", NORTH_WEST="NW"
}

export class DirectionalHit {
  constructor( public direction : Direction, public node: WorkflowNode, public x:number, public y:number ){}
}

const MIN_DIMENSION: number = 20
export abstract class WorkflowNode {

  selected: boolean;

  constructor(public canvas: WorkflowCanvasComponent, public x:number, public y: number ){}

  abstract containsPointResize(x:number,y:number):DirectionalHit
  abstract containsPointConnection(x:number,y:number):DirectionalHit
  abstract containsPoint(x:number,y:number):boolean
  abstract isInsideRect(x0:number,y0:number,x1:number,y1:number):boolean
  abstract resize(direction:Direction,dx:number,dy:number)
  
  isSelected():boolean{ return this.selected && !this.canvas.isSelecting; }
  isCanvasConnectionHit(direction:Direction):boolean{ 
    return (this.canvas.sourceHit != null && this.canvas.sourceHit.node === this && this.canvas.sourceHit.direction==direction)  
    || (this.canvas.targetHit != null && this.canvas.targetHit.node === this && this.canvas.targetHit.direction==direction)
  }

  showNorthConnection(): boolean {
    return this.isCanvasConnectionHit(Direction.NORTH);
  }
  showNorthEastConnection(): boolean {
    return this.isCanvasConnectionHit(Direction.NORTH_EAST);
  }
  showEastConnection(): boolean {
    return this.isCanvasConnectionHit(Direction.EAST);
  }
  showSouthEastConnection(): boolean {
    return this.isCanvasConnectionHit(Direction.SOUTH_EAST);
  }
  showSouthConnection(): boolean {
    return this.isCanvasConnectionHit(Direction.SOUTH);
  }
  showSouthWestConnection(): boolean {
    return this.isCanvasConnectionHit(Direction.SOUTH_WEST);
  }
  showWestConnection(): boolean {
    return this.isCanvasConnectionHit(Direction.WEST);
  }
  showNorthWestConnection(): boolean {
    return this.isCanvasConnectionHit(Direction.NORTH_WEST);
  }
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

  containsPointResize(x:number,y:number):DirectionalHit{
    if(this.selected){
      if( Utils.cirleContainsPoint(this.x,this.y,5,x,y) ){
        return new DirectionalHit(Direction.NORTH_WEST,this,x,y);
      }
      else if( Utils.cirleContainsPoint(this.x+(this.width/2),this.y,5,x,y) ){
        return new DirectionalHit(Direction.NORTH,this,x,y);
      }
      else if( Utils.cirleContainsPoint(this.x+this.width,this.y,5,x,y) ){
        return new DirectionalHit(Direction.NORTH_EAST,this,x,y);
      }
      else if( Utils.cirleContainsPoint(this.x+this.width,this.y+(this.height/2),5,x,y) ){
        return new DirectionalHit(Direction.EAST,this,x,y);
      }
      else if( Utils.cirleContainsPoint(this.x+this.width,this.y+this.height,5,x,y) ){
        return new DirectionalHit(Direction.SOUTH_EAST,this,x,y);
      }
      else if( Utils.cirleContainsPoint(this.x+(this.width/2),this.y+this.height,5,x,y) ){
        return new DirectionalHit(Direction.SOUTH,this,x,y);
      }
      else if( Utils.cirleContainsPoint(this.x,this.y+this.height,5,x,y)){
        return new DirectionalHit(Direction.SOUTH_WEST,this,x,y);
      }
      else if( Utils.cirleContainsPoint(this.x,this.y+(this.height/2),5,x,y) ){
        return new DirectionalHit(Direction.WEST,this,x,y);
      }
    }
    return null;
  }

  resize(direction:Direction,dx:number,dy:number){
    switch(direction){
      case Direction.NORTH:
        this.y = this.y + dy;
        this.height = this.height - dy;
        this.minNorth();
        break;
      case Direction.SOUTH:
        this.height = this.height + dy;
        this.minSouth();
        break;
      case Direction.WEST:
        this.x = this.x + dx;
        this.width = this.width - dx;
        this.minWest();
        break;
      case Direction.EAST:
        this.width = this.width + dx;
        this.minEast();
        break;
      case Direction.NORTH_EAST:
        this.y = this.y + dy;
        this.height = this.height - dy;
        this.width = this.width + dx;
        this.minNorth();
        this.minEast();
        break;
      case Direction.SOUTH_EAST:
        this.height = this.height + dy;
        this.width = this.width + dx;
        this.minEast();
        this.minSouth();
        break;
      case Direction.NORTH_WEST:
        this.x = this.x + dx;
        this.width = this.width - dx;
        this.y = this.y + dy;
        this.height = this.height - dy;
        this.minNorth();
        this.minWest();
        break;
      case Direction.SOUTH_WEST:
        this.x = this.x + dx;
        this.width = this.width - dx;
        this.height = this.height + dy;
        this.minSouth();
        this.minWest();
        break;
    }
  }

  minNorth(){
    if(this.height<MIN_DIMENSION){
      this.y = this.y - (MIN_DIMENSION - this.height);
      this.height = MIN_DIMENSION;
    }
  }

  minSouth(){
    if(this.height<MIN_DIMENSION) this.height = MIN_DIMENSION;
  }

  minEast(){
    if(this.width<MIN_DIMENSION) this.width = MIN_DIMENSION;
  }

  minWest(){
    if(this.width<MIN_DIMENSION){
      this.x = this.x - (MIN_DIMENSION - this.width);
      this.width = MIN_DIMENSION;
    }
  }

  containsPointConnection(x:number,y:number):DirectionalHit{
    if( Utils.cirleContainsPoint(this.x+(this.width/2),this.y,5,x,y) ){
      return new DirectionalHit(Direction.NORTH,this,this.x+(this.width/2),this.y);
    }
    else if( Utils.cirleContainsPoint(this.x+this.width,this.y+(this.height/2),5,x,y) ){
      return new DirectionalHit(Direction.EAST,this,this.x+this.width,this.y+(this.height/2));
    }
    else if( Utils.cirleContainsPoint(this.x+(this.width/2),this.y+this.height,5,x,y) ){
      return new DirectionalHit(Direction.SOUTH,this,this.x+(this.width/2),this.y+this.height);
    }
    else if( Utils.cirleContainsPoint(this.x,this.y+(this.height/2),5,x,y) ){
      return new DirectionalHit(Direction.WEST,this,this.x,this.y+(this.height/2));
    }
    return null;
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

  containsPointResize(x:number,y:number):DirectionalHit{
    if(this.selected){
      if( Utils.cirleContainsPoint(this.x+this.radius,this.y,5,x,y) ){
        return new DirectionalHit(Direction.EAST,this,x,y);
      }
    }
    return null;
  }

  resize(direction:Direction,dx:number,dy:number){
    this.radius = this.radius + dx;
    if( this.radius < MIN_DIMENSION/2 ) this.radius = MIN_DIMENSION/2;
  }

  containsPointConnection(x:number,y:number):DirectionalHit{
    if( Utils.cirleContainsPoint(this.x,this.y-this.radius,5,x,y) ){
      return new DirectionalHit(Direction.NORTH,this,this.x,this.y-this.radius);
    }
    else if( Utils.cirleContainsPoint(this.x+this.radius,this.y,5,x,y) ){
      return new DirectionalHit(Direction.EAST,this,this.x+this.radius,this.y);
    }
    else if( Utils.cirleContainsPoint(this.x,this.y+this.radius,5,x,y) ){
      return new DirectionalHit(Direction.SOUTH,this,this.x,this.y+this.radius);
    }
    else if( Utils.cirleContainsPoint(this.x-this.radius,this.y,5,x,y) ){
      return new DirectionalHit(Direction.WEST,this,this.x-this.radius,this.y);
    }
    return null;
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

  containsPointResize(x:number,y:number):DirectionalHit{
    if(this.selected){
      if( Utils.cirleContainsPoint(this.x,this.y-(this.height/2),5,x,y) ){
        return new DirectionalHit(Direction.NORTH,this,x,y);
      }
      else if( Utils.cirleContainsPoint(this.x+(this.width/2),this.y,5,x,y) ){
        return new DirectionalHit(Direction.EAST,this,x,y);
      }
      else if( Utils.cirleContainsPoint(this.x,this.y+(this.height/2),5,x,y) ){
        return new DirectionalHit(Direction.SOUTH,this,x,y);
      }
      else if( Utils.cirleContainsPoint(this.x-(this.width/2),this.y,5,x,y) ){
        return new DirectionalHit(Direction.WEST,this,x,y);
      }
    }
    return null;
  }

  resize(direction:Direction,dx:number,dy:number){
    switch(direction){
      case Direction.NORTH:
        this.height = this.height - (2*dy);
        if( this.height < MIN_DIMENSION ){
          this.height = MIN_DIMENSION;
        }
        break;
      case Direction.SOUTH:
        this.height = this.height + (2*dy);
        if( this.height < MIN_DIMENSION ){
          this.height = MIN_DIMENSION;
        } 
        break;
      case Direction.WEST:
        this.width = this.width - (2*dx);
        if( this.width < MIN_DIMENSION ){
          this.width = MIN_DIMENSION;
        } 
        break;
      case Direction.EAST:
        this.width = this.width + (2*dx);
        if( this.width < MIN_DIMENSION ){
          this.width = MIN_DIMENSION;
        } 
        break;
    }
  }

  containsPointConnection(x:number,y:number):DirectionalHit{
    if( Utils.cirleContainsPoint(this.x,this.y-(this.height/2),5,x,y) ){
      return new DirectionalHit(Direction.NORTH,this,this.x,this.y-(this.height/2));
    }
    else if( Utils.cirleContainsPoint(this.x+(this.width/2),this.y,5,x,y) ){
      return new DirectionalHit(Direction.EAST,this,this.x+(this.width/2),this.y);
    }
    else if( Utils.cirleContainsPoint(this.x,this.y+(this.height/2),5,x,y) ){
      return new DirectionalHit(Direction.SOUTH,this,this.x,this.y+(this.height/2));
    }
    else if( Utils.cirleContainsPoint(this.x-(this.width/2),this.y,5,x,y) ){
      return new DirectionalHit(Direction.WEST,this,this.x-(this.width/2),this.y);
    }
    return null;
  }
}

export class WorkflowEdge {
  constructor( public source: DirectionalHit, public target: DirectionalHit ){}

  connectionPath():string{
    return `M ${this.source.x} ${this.source.y} L ${this.target.x} ${this.target.y}`
  }
}