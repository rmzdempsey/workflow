import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';
import * as _ from "lodash";

@Component({
  selector: 'app-workflow-canvas',
  templateUrl: './workflow-canvas.component.html',
  styleUrls: ['./workflow-canvas.component.scss']
})
export class WorkflowCanvasComponent implements OnInit, AfterViewInit {

  constructor() { }

  model : WorkflowModel;
  undoStack: Array<WorkflowModel> = [];
  undoStackIndex: number = -1;

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
    this.model.nodes.forEach(n=>n.selected=false);
    this.model.nodes.push(n)
    n.selected = true
    this.postEdit()
  }

  ngOnInit() {
    this.model=new WorkflowModel();
    this.postEdit();
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

    let resizeHits:Array<WorkflowNode> = this.model.nodes.slice().reverse().filter(n=>n.containsPointResize(e.offsetX,e.offsetY))
    if(resizeHits.length>0){
      this.resizeHit = resizeHits[0].containsPointResize(e.offsetX,e.offsetY)
      return
    }

    let hit : WorkflowNode = this.model.nodes.slice().reverse().find(n=>n.containsPoint(e.offsetX,e.offsetY))

    if(!hit){
      this.model.nodes.forEach(n=>n.selected=false);
      this.isSelecting = true;
      this.selectionStartX = e.offsetX;
      this.selectionStartY = e.offsetY;
      this.selectionEndX = e.offsetX;
      this.selectionEndY = e.offsetY;
    }
    else{
      this.isDragging = true;
      if(!hit.selected){
        this.model.nodes.forEach(n=>n.selected=false);
        hit.selected = true;
      }
      hit.selected = true;
      (e.srcElement as HTMLElement).setPointerCapture(e.pointerId);
    }
  }

  onPointerUp(e:PointerEvent){
    if( this.sourceHit && this.targetHit ){
      this.model.edges.push(new WorkflowEdge(this.sourceHit,this.targetHit))
      this.postEdit()
    }
    else if( this.isDragging ){
      (e.srcElement as HTMLElement).releasePointerCapture(e.pointerId);
      this.postEdit()
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
      let targetHits:Array<WorkflowNode> = this.model.nodes.slice().reverse().filter(n=>n.containsPointConnection(e.offsetX,e.offsetY)).filter(n=>n!=this.sourceHit.node)
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
      this.model.nodes.filter(n=>n.selected)
      .forEach(n=>{
        n.x = n.x + e.movementX
        n.y = n.y + e.movementY
      })
    }
    else if( this.isSelecting ){
      this.selectionEndX = e.offsetX;
      this.selectionEndY = e.offsetY
      this.model.nodes.filter(n=> n.isInsideRect(this.selectionStartX, this.selectionStartY, e.offsetX,e.offsetY))
        .forEach(n=>n.selected=true)
    }
    else{
      let sourceHits:Array<WorkflowNode> = this.model.nodes.slice().reverse().filter(n=>n.containsPointConnection(e.offsetX,e.offsetY)).filter(n=>!n.selected)
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

  postEdit(){
    let cloned = _.cloneDeep(this.model);
    cloned.nodes.forEach(n=>n.canvas=null);
    while(this.undoStack.length>this.undoStackIndex+1){
      this.undoStack.pop();
    }
    this.undoStack.push(cloned);
    this.undoStackIndex=this.undoStack.length-1;
  }

  undo(){
    if(this.undoStackIndex>0){
      this.undoStackIndex=this.undoStackIndex-1;
      let peekModel = _.cloneDeep(this.undoStack[this.undoStackIndex]);
      peekModel.nodes.forEach(n=>n.canvas=this);
      this.model=peekModel;
    }
  }
  redo(){
    if(this.undoStackIndex<this.undoStack.length-1){
      this.undoStackIndex=this.undoStackIndex+1;
      let peekModel = _.cloneDeep(this.undoStack[this.undoStackIndex]);
      peekModel.nodes.forEach(n=>n.canvas=this);
      this.model=peekModel;
    }
  }
  copy(){
    console.log("copy request")
  }
  paste(){
    console.log("paste request")
  }
  cut(){
    console.log("cut request")
  }
  delete(){
    console.log("delete request")
  }
}

export class WorkflowModel{
  constructor(public nodes : Array<WorkflowNode> = [], public edges : Array<WorkflowEdge> = [] ){

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

  abstract containsPoint(x:number,y:number):boolean
  abstract isInsideRect(x0:number,y0:number,x1:number,y1:number):boolean
  abstract resize(direction:Direction,dx:number,dy:number)

  abstract getNx(): number;
  abstract getNEx(): number;
  abstract getEx(): number;
  abstract getSEx(): number;
  abstract getSx(): number;
  abstract getSWx(): number;
  abstract getWx(): number;
  abstract getNWx(): number;

  abstract getNy(): number;
  abstract getNEy(): number;
  abstract getEy(): number;
  abstract getSEy(): number;
  abstract getSy(): number;
  abstract getSWy(): number;
  abstract getWy(): number;
  abstract getNWy(): number;
  
  isSelected():boolean{ return this.selected && !this.canvas.isSelecting; }
  isCanvasConnectionHit(direction:Direction):boolean{ 
    return (this.canvas.sourceHit != null && this.canvas.sourceHit.node == this && this.canvas.sourceHit.direction==direction)  
    || (this.canvas.targetHit != null && this.canvas.targetHit.node == this && this.canvas.targetHit.direction==direction)
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

  containsPointResize(x:number,y:number):DirectionalHit{
    if(this.selected){
      if( Utils.cirleContainsPoint(this.getNx(),this.getNy(),5,x,y) ){
        return new DirectionalHit(Direction.NORTH,this,x,y);
      }
      else if( Utils.cirleContainsPoint(this.getEx(),this.getEy(),5,x,y) ){
        return new DirectionalHit(Direction.EAST,this,x,y);
      }
      else if( Utils.cirleContainsPoint(this.getSx(),this.getSy(),5,x,y) ){
        return new DirectionalHit(Direction.SOUTH,this,x,y);
      }
      else if( Utils.cirleContainsPoint(this.getWx(),this.getWy(),5,x,y) ){
        return new DirectionalHit(Direction.WEST,this,x,y);
      }
      else if( Utils.cirleContainsPoint(this.getNEx(),this.getNEy(),5,x,y) ){
        return new DirectionalHit(Direction.NORTH_EAST,this,x,y);
      }
      else if( Utils.cirleContainsPoint(this.getNWx(),this.getNWy(),5,x,y) ){
        return new DirectionalHit(Direction.NORTH_WEST,this,x,y);
      }
      else if( Utils.cirleContainsPoint(this.getSEx(),this.getSEy(),5,x,y) ){
        return new DirectionalHit(Direction.SOUTH_EAST,this,x,y);
      }
      else if( Utils.cirleContainsPoint(this.getSWx(),this.getSWy(),5,x,y) ){
        return new DirectionalHit(Direction.SOUTH_WEST,this,x,y);
      }
    }
    return null;
  }

  containsPointConnection(x:number,y:number):DirectionalHit{
    if( Utils.cirleContainsPoint(this.getNx(),this.getNy(),5,x,y) ){
      return new DirectionalHit(Direction.NORTH,this,this.getNx(),this.getNy());
    }
    else if( Utils.cirleContainsPoint(this.getEx(),this.getEy(),5,x,y) ){
      return new DirectionalHit(Direction.EAST,this,this.getEx(),this.getEy());
    }
    else if( Utils.cirleContainsPoint(this.getSx(),this.getSy(),5,x,y) ){
      return new DirectionalHit(Direction.SOUTH,this,this.getSx(),this.getSy());
    }
    else if( Utils.cirleContainsPoint(this.getWx(),this.getWy(),5,x,y) ){
      return new DirectionalHit(Direction.WEST,this,this.getWx(),this.getWy());
    }
    else if( Utils.cirleContainsPoint(this.getNEx(),this.getNEy(),5,x,y) ){
      return new DirectionalHit(Direction.NORTH_EAST,this,this.getNEx(),this.getNEy());
    }
    else if( Utils.cirleContainsPoint(this.getNWx(),this.getNWy(),5,x,y) ){
      return new DirectionalHit(Direction.NORTH_WEST,this,this.getNWx(),this.getNWy());
    }
    else if( Utils.cirleContainsPoint(this.getSEx(),this.getSEy(),5,x,y) ){
      return new DirectionalHit(Direction.SOUTH_EAST,this,this.getSEx(),this.getSEy());
    }
    else if( Utils.cirleContainsPoint(this.getSWx(),this.getSWy(),5,x,y) ){
      return new DirectionalHit(Direction.SOUTH_WEST,this,this.getSWx(),this.getSWy());
    }
    return null;
  }

  getX(direction:Direction):number{
    if(direction==Direction.NORTH) return this.getNx();
    else if(direction==Direction.NORTH_EAST) return this.getNEx();
    else if(direction==Direction.EAST) return this.getEx();
    else if(direction==Direction.SOUTH_EAST) return this.getSEx();
    else if(direction==Direction.SOUTH) return this.getSx();
    else if(direction==Direction.SOUTH_WEST) return this.getSWx();
    else if(direction==Direction.WEST) return this.getWx();
    else return this.getNWx();
  }

  getY(direction:Direction):number{
    if(direction==Direction.NORTH) return this.getNy();
    else if(direction==Direction.NORTH_EAST) return this.getNEy();
    else if(direction==Direction.EAST) return this.getEy();
    else if(direction==Direction.SOUTH_EAST) return this.getSEy();
    else if(direction==Direction.SOUTH) return this.getSy();
    else if(direction==Direction.SOUTH_WEST) return this.getSWy();
    else if(direction==Direction.WEST) return this.getWy();
    else return this.getNWy();
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

  getNx(): number { return this.x + (this.width/2); }
  getNEx(): number { return this.x + this.width; }
  getEx(): number { return this.x + this.width; }
  getSEx(): number { return this.x + this.width; }
  getSx(): number { return this.x + (this.width/2); }
  getSWx(): number { return this.x; }
  getWx(): number { return this.x; }
  getNWx(): number{ return this.x; }

  getNy(): number { return this.y; }
  getNEy(): number { return this.y; }
  getEy(): number { return this.y + (this.height/2); }
  getSEy(): number { return this.y + this.height; }
  getSy(): number { return this.y + this.height;; }
  getSWy(): number { return this.y + this.height;; }
  getWy(): number { return this.y + (this.height/2); }
  getNWy(): number{ return this.y; }
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

  resize(direction:Direction,dx:number,dy:number){
    this.radius = this.radius + dx;
    if( this.radius < MIN_DIMENSION/2 ) this.radius = MIN_DIMENSION/2;
  }

  getNx(): number { return this.x; }
  getNEx(): number { return ; }
  getEx(): number { return this.x + this.radius; }
  getSEx(): number { return ; }
  getSx(): number { return this.x; }
  getSWx(): number { return ; }
  getWx(): number { return this.x - this.radius; }
  getNWx(): number{ return ; }

  getNy(): number { return this.y-this.radius; }
  getNEy(): number { return ; }
  getEy(): number { return this.y; }
  getSEy(): number { return ; }
  getSy(): number { return this.y+this.radius; }
  getSWy(): number { return ; }
  getWy(): number { return this.y; }
  getNWy(): number{ return ; }

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

  getNx(): number { return this.x; }
  getNEx(): number { return ; }
  getEx(): number { return this.x + (this.width/2); }
  getSEx(): number { return ; }
  getSx(): number { return this.x; }
  getSWx(): number { return ; }
  getWx(): number { return this.x - (this.width/2); }
  getNWx(): number{ return ; }

  getNy(): number { return this.y-(this.height/2); }
  getNEy(): number { return ; }
  getEy(): number { return this.y; }
  getSEy(): number { return ; }
  getSy(): number { return this.y+(this.height/2); }
  getSWy(): number { return ; }
  getWy(): number { return this.y; }
  getNWy(): number{ return ; }
}

export class WorkflowEdge {
  constructor( public source: DirectionalHit, public target: DirectionalHit ){}

  connectionPath():string{
    let x0 = this.source.node.getX(this.source.direction);
    let y0 = this.source.node.getY(this.source.direction);
    let x1 = this.target.node.getX(this.target.direction);
    let y1 = this.target.node.getY(this.target.direction);
    return `M ${x0} ${y0} L ${x1} ${y1}`
  }
}