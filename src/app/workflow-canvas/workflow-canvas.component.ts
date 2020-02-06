import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';
import * as _ from "lodash";
import { nextId, Utils, WorkflowModel, UndoEntry, DirectionalHit, RectWorkflowNode, DiamondWorkflowNode, CircleWorkflowNode, WorkflowNode, WorkflowEdge } from './workflow.model';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-workflow-canvas',
  templateUrl: './workflow-canvas.component.html',
  styleUrls: ['./workflow-canvas.component.scss']
})
export class WorkflowCanvasComponent implements OnInit, AfterViewInit {

  constructor() { }

  model : WorkflowModel;
  clipBoard: WorkflowModel;
  undoStack: Array<UndoEntry> = [];
  undoStackIndex: number = -1;

  _isGroupSelecting: boolean = false;
  _groupSelectStartX: number;
  _groupSelectStartY: number;
  _groupSelectEndX: number;
  _groupSelectEndY: number;

  _currentSourceConnectionHover: DirectionalHit;
  _currentTargetConnectionHover: DirectionalHit;
  _isConnecting: boolean;
  _connectingStartX: number;
  _connectingStartY: number;
  _connectingEndX: number;
  _connectingEndY: number;
  _connectingEdge : WorkflowEdge;

  _isResizingNode: boolean = false;
  _currentResizeHandle: DirectionalHit;

  _isDragging: boolean = false;
  // _resizeStartX: number;
  // _resizeStartY: number;
  // _resizeEndX: number;
  // _resizeEndY: number;

  // isDragging: boolean;
  // isConnecting: boolean;
  // resizeHit: DirectionalHit;
  // sourceHit: DirectionalHit;
  // targetHit: DirectionalHit;
  // selectionStartX: number;
  // selectionStartY: number;
  // startDragX: number;
  // startDragY: number;
  // selectionEndX: number;
  // selectionEndY: number;
  // connectingX: number;
  // connectingY: number;
  
  newTask(){
    this.addNode( new RectWorkflowNode(
      100,
      100,
      100,
      100,
    ))
  }

  newDecision(){
    this.addNode( new DiamondWorkflowNode(
      100,
      100,
      100,
      100,
    ))
  }

  newTerminator(){
    this.addNode( new CircleWorkflowNode(
      100,
      100,
      30,
    ))
  }

  addNode(n:WorkflowNode){
    this.model.nodes.forEach(n=>n.selected=false);
    this.model.nodes.push(n)
    this.postEdit("ADD");
  }

  ngOnInit() {
    this.model=new WorkflowModel();
    this.postEdit("INIT");
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
    // this.isSelecting = false;
    // this.isDragging = false;
    // this.resizeHit = null;

    const x = e.offsetX;
    const y = e.offsetY;

    if(this.isOverSourceConnectionPointOnlyIfNodeNotSelected(x,y)){
      //this.selectSourceConnectionPoint();
      this.startConnecting(x,y)
    }
    else if( this.isOverNodeResizePointOnlyIfNodeSelected(x,y) ){
      this.startResizeNode(x,y);
    }
    else if( this.isOverNodeOnlyIfNodeNotSelected(x,y) ){
      this.selectNode(x,y);
    }
    else if( this.isOverNodeOnlyIfInSelection(x,y) ){
      // enough to start dragging
    }
    else if( this.isOverEdgeJunctionPoint() ){
      this.selectEdgeJunctionPoint()
    }
    else if( this.isOverEdgeNotSelected(x,y) ){
      this.selectEdge(x,y);
    }
    else{
      this.startGroupSelect(x,y); 
    }

    (e.srcElement as HTMLElement).setPointerCapture(e.pointerId);
    
    //{

      // let resizeHits:Array<WorkflowNode> = this.model.nodes.slice().reverse().filter(n=>n.containsPointResize(e.offsetX,e.offsetY))
      // if(resizeHits.length>0){
      //   this.resizeHit = resizeHits[0].containsPointResize(e.offsetX,e.offsetY)
      //   return
      // }

      // let hitN : WorkflowNode = this.model.nodes.slice().reverse().find(n=>n.containsPoint(e.offsetX,e.offsetY))
      // let hitE : WorkflowEdge = this.model.edges.slice().reverse().find(n=>n.containsPoint(this,e.offsetX,e.offsetY))

      // console.log('hit edge', hitE)

      // if(!hitN && !hitE){
      //   this.model.nodes.forEach(n=>n.selected=false);
      //   this.model.edges.forEach(e=>e.selected=false);
      //   this.isSelecting = true;
      //   this.selectionStartX = e.offsetX;
      //   this.selectionStartY = e.offsetY;
      //   this.selectionEndX = e.offsetX;
      //   this.selectionEndY = e.offsetY;
      // }
      // else{
      //   this.isDragging = true;
      //   this.startDragX = e.offsetX;
      //   this.startDragY = e.offsetY;
      //   if(hitN){
      //     if(!hitN.selected){
      //       this.model.nodes.forEach(n=>n.selected=false);
      //       this.model.edges.forEach(n=>n.selected=false);
      //       hitN.selected = true;
      //     }
      //     hitN.selected = true;
      //     (e.srcElement as HTMLElement).setPointerCapture(e.pointerId);
      //   }
      //   if(hitE){
      //     if(!hitE.selected){
      //       this.model.nodes.forEach(n=>n.selected=false);
      //       this.model.edges.forEach(n=>n.selected=false);
      //       hitE.selected = true;
      //     }
      //     hitE.selected = true;
      //     //(e.srcElement as HTMLElement).setPointerCapture(e.pointerId);
      //   }
      // }
   // }
  }

  onPointerUp(e:PointerEvent){
    
    if(this.isGroupSelecting()){
      this.stopGroupSelect(); 
    }
    else if(this.isResizingNode()){
      this.stopResizeNode();
      this.postEdit("RESIZE")
    }
    else if(this.isConnecting()){
      this.stopConnecting();
      this.postEdit("NEW EDGE")
    }
    else if(this.isDragging()){
      this.stopDragging();
      this.postEdit("MOVE")
    }

    (e.srcElement as HTMLElement).releasePointerCapture(e.pointerId);
    // if( this.sourceHit && this.targetHit ){
    //   this.model.edges.push(new WorkflowEdge(this.sourceHit.node.id,this.sourceHit.direction,this.targetHit.node.id,this.targetHit.direction))
    //   this.postEdit("NEW EDGE")
    // }
    // else if( this.isDragging ){
    //   (e.srcElement as HTMLElement).releasePointerCapture(e.pointerId);
    //   if( this.startDragX != e.offsetX || this.startDragY != e.offsetY )
    //     this.postEdit("MOVE")
    // }
    // this.isDragging = false;
    // this.isSelecting = false;
    // this.isConnecting = false;
    // this.resizeHit = null;
    // this.sourceHit=null;
    // this.targetHit=null;
  }

  onPointerMove(e:PointerEvent){
    const x = e.offsetX;
    const y = e.offsetY;

    if( this.isGroupSelecting() ){
      this.updateGroupSelect(x,y)
    }
    else if( this.isConnecting() ){
      this.updateConnection(x,y,e.movementX,e.movementY)
      if(this.isOverTargetConnectionPoint(x,y)){
        // should render target handle
      }
    }
    else if(this.isOverSourceConnectionPointOnlyIfNodeNotSelected(x,y)){
      // should render source handle
    }
    else if(this.isResizingNode()){
      this.updateResizeNode(e.movementX,e.movementY);
    }
    else if( e.buttons == 1 ){ // left mouse button down
      this.updateDragIfSelection(e.movementX,e.movementY);
    }
    // this.targetHit = null;
    // if(this.isConnecting){
    //   this.connectingX=e.offsetX;
    //   this.connectingY=e.offsetY;
    //   let targetHits:Array<WorkflowNode> = this.model.nodes.slice().reverse().filter(n=>n.containsPointConnection(e.offsetX,e.offsetY)).filter(n=>n.id!=this.sourceHit.node.id)
    //   if(targetHits.length>0){
    //     this.targetHit = targetHits[0].containsPointConnection(e.offsetX,e.offsetY);
    //     return
    //   }
    //   return;
    // }
    // this.sourceHit = null;
    // if( this.resizeHit ){
    //   this.resizeHit.node.resize(this.resizeHit.direction,e.movementX,e.movementY)
    // }
    // else if( this.isDragging ){
    //   this.model.nodes.filter(n=>n.selected)
    //   .forEach(n=>{
    //     n.x = n.x + e.movementX
    //     n.y = n.y + e.movementY
    //   })
    // }
    // else if( this.isSelecting ){
    //   this.selectionEndX = e.offsetX;
    //   this.selectionEndY = e.offsetY
    //   this.model.nodes.filter(n=> n.isInsideRect(this.selectionStartX, this.selectionStartY, e.offsetX,e.offsetY))
    //     .forEach(n=>n.selected=true)
    //   this.model.edges.filter(ee=> ee.isInsideRect(this,this.selectionStartX, this.selectionStartY, e.offsetX,e.offsetY))
    //     .forEach(n=>n.selected=true)
    // }
    // else{
    //   let sourceHits:Array<WorkflowNode> = this.model.nodes.slice().reverse().filter(n=>n.containsPointConnection(e.offsetX,e.offsetY)).filter(n=>!n.selected)
    //   if(sourceHits.length>0){
    //     this.sourceHit = sourceHits[0].containsPointConnection(e.offsetX,e.offsetY);
    //     return
    //   }
    // }
  }

  isOverSourceConnectionPointOnlyIfNodeNotSelected(x:number,y:number):boolean{
    this._currentSourceConnectionHover = null;
    
    const n = this.model.nodes.slice().reverse().filter(n=>!n.selected).find(n=>n.containsPointConnection(x,y));
    if( n!= null ){
      this._currentSourceConnectionHover = n.containsPointConnection(x,y)
    }
    
    return this._currentSourceConnectionHover != null;
  }

  isOverTargetConnectionPoint(x:number,y:number):boolean{
    this._currentTargetConnectionHover = null;
    
    if( this._currentSourceConnectionHover != null ){
      const n = this.model.nodes.slice().reverse()
        .filter(n=>!n.selected && n!=this._currentSourceConnectionHover.node).find(n=>n.containsPointConnection(x,y));
      if( n!= null ){
        this._currentTargetConnectionHover = n.containsPointConnection(x,y)
      }
    }
    
    return this._currentTargetConnectionHover != null;
  }

  isOverNodeResizePointOnlyIfNodeSelected(x:number,y:number):boolean{
    return this.model.nodes.slice().reverse().filter(n=>n.selected).find(n=>n.containsPointResize(x,y)) != null;
  }
  isResizingNode():boolean{
    return this._isResizingNode;
  }
  startResizeNode(x:number,y:number){
    this._isResizingNode = true;
    const resizingNode :WorkflowNode = this.model.nodes.slice().reverse().find(n=>n.containsPointResize(x,y))
    this._currentResizeHandle = resizingNode.containsPointResize(x,y);
    console.log('selecting node resize pt')
  }
  stopResizeNode(){
    this._isResizingNode = false;
    this._currentResizeHandle = null;
    console.log('stop node resize')
  }
  updateResizeNode(dx:number,dy:number){
    console.log('resizing node', this._currentResizeHandle)
    this._currentResizeHandle.node.resize(this._currentResizeHandle.direction,dx,dy)
  }

  isOverNodeOnlyIfNodeNotSelected(x:number,y:number){
    return this.model.nodes.slice().reverse().filter(n=>!n.selected).find(n=>n.containsPoint(x,y)) != null;
  }
  isOverNodeOnlyIfInSelection(x:number,y:number){
    return this.model.nodes.slice().reverse().filter(n=>n.selected).find(n=>n.containsPoint(x,y)) != null;
  }

  isOverEdgeJunctionPoint(){
    return false;
  }

  isOverEdgeNotSelected(x:number,y:number):boolean{
    return this.model.edges.slice().reverse().filter(n=>!n.selected).find(n=>n.containsPoint(this,x,y)) != null;
  }

  // selectSourceConnectionPoint(){
  //   console.log('selecting stc connection pt')
  //   this.model.nodes.forEach(n=>n.selected=false)
  //   this.model.edges.forEach(e=>e.selected=false)
  //   this._isConnecting = true;
  //   this._connectingStartX = this._currentSourceConnectionHover.getHandleX();
  //   this._connectingStartY = this._currentSourceConnectionHover.getHandleY();
  //   this._connectingEndX = this._connectingStartX;
  //   this._connectingEndY = this._connectingStartY;
  // }
  startConnecting(x:number,y:number){
    this.model.nodes.forEach(n=>n.selected=false)
    this.model.edges.forEach(e=>e.selected=false)
    this._isConnecting = true;
    this._connectingEdge = new WorkflowEdge(this._currentSourceConnectionHover)
    this._connectingEdge.selected=true;
    this.model.edges.push(this._connectingEdge);
  }
  isConnecting():boolean{
    return this._isConnecting;
  }
  updateConnection(x:number,y:number,dx:number,dy:number){
    this._connectingEdge.calculateConnectingPathOnDrag(this,x,y,dx,dy)
    // this._connectingEndX = x;
    // this._connectingEndY = y;
  }
  stopConnecting(){
    this._isConnecting = false;
    if( this._currentSourceConnectionHover != null && this._currentTargetConnectionHover ){
      this._connectingEdge.connect(this,this._currentTargetConnectionHover);
      // this.model.edges.push(new WorkflowEdge(
      //   this._currentSourceConnectionHover.node.id,
      //   this._currentSourceConnectionHover.direction,
      //   this._currentTargetConnectionHover.node.id,
      //   this._currentTargetConnectionHover.direction
      // ))
    }
    this._currentSourceConnectionHover = null;
    this._currentTargetConnectionHover = null;
  }
  
  selectNode(x:number,y:number){
    console.log('selecting node')
    this.model.nodes.forEach(n=>n.selected=false)
    this.model.edges.forEach(e=>e.selected=false)
    this.model.nodes.slice().reverse().find(n=>n.containsPoint(x,y)).selected=true;
  }
  selectEdgeJunctionPoint(){
    console.log('selecting edge junction pt')
  }
  selectEdge(x:number,y:number){
    this.model.nodes.forEach(n=>n.selected=false)
    this.model.edges.forEach(e=>e.selected=false)
    this.model.edges.slice().reverse().find(e=>e.containsPoint(this,x,y)).selected=true;
    console.log('selecting edge')
  }

  startGroupSelect(x:number,y:number){
    console.log('starting group select')
    this.model.nodes.forEach(n=>n.selected=false);
    this.model.edges.forEach(e=>e.selected=false);
    this._isGroupSelecting = true;
    this._groupSelectStartX = x;
    this._groupSelectStartY = y;
    this._groupSelectEndX = x;
    this._groupSelectEndY = y;
  }
  isGroupSelecting():boolean{
    return this._isGroupSelecting;
  }
  stopGroupSelect(){
    console.log('stopping group select', this._groupSelectStartX, this._groupSelectStartY, this._groupSelectEndX, this._groupSelectEndY )
    this._isGroupSelecting = false;
    const x : Array<number> = Utils.orderValues(this._groupSelectStartX,this._groupSelectEndX)
    const y : Array<number> = Utils.orderValues(this._groupSelectStartY,this._groupSelectEndY)
    this.model.nodes.filter(n=> n.isInsideRect(x[0],y[0],x[1]-x[0], y[1]-y[0])).forEach(n=>n.selected=true)
    this.model.edges.filter(ee=>ee.isInsideRect(this,x[0],y[0],x[1]-x[0], y[1]-y[0])).forEach(n=>n.selected=true)
  }
  updateGroupSelect(x:number,y:number){
    this._groupSelectEndX = x;
    this._groupSelectEndY = y;
  }
  getGroupSelectionStartX():number{ 
    return Math.min(this._groupSelectEndX,this._groupSelectStartX);
  }
  getGroupSelectionStartY():number{
    return Math.min(this._groupSelectEndY,this._groupSelectStartY);
  }
  getGroupSelectionWidth():number{
    return Math.abs(this._groupSelectEndX-this._groupSelectStartX);
  }
  getGroupSelectionHeight():number{
    return Math.abs(this._groupSelectEndY-this._groupSelectStartY);
  }

  updateDragIfSelection(dx:number,dy:number){
    let selected : Array<WorkflowNode> = this.model.nodes.filter(n=>n.selected);
    if(selected.length>0){
      this._isDragging = true;
      selected.forEach(n=>n.moveBy(this,dx,dy))
        //{
        // n.x=n.x+dx
        // n.y=n.y+dy
      //})
    }
  }
  isDragging():boolean{
    return this._isDragging;
  }
  stopDragging(){
    this._isDragging = false;
  }

  getCurrentSourceConnectionHover(){
    return this._currentSourceConnectionHover;
  }
  getCurrentTargetConnectionHover(){
    return this._currentTargetConnectionHover;
  }

  connectionPath():string{
    return `M ${this._connectingStartX} ${this._connectingStartY} L ${this._connectingEndX} ${this._connectingEndY}`
  }

  postEdit(editType:string){
    let cloned :WorkflowModel= _.cloneDeep(this.model);
    while(this.undoStack.length>this.undoStackIndex+1){
      this.undoStack.pop();
    }
    this.undoStack.push({desc:editType,model:cloned});
    this.undoStackIndex=this.undoStack.length-1;
  }

  undo(){
    if(this.undoStackIndex>0){
      this.undoStackIndex=this.undoStackIndex-1;
      let peekModel = _.cloneDeep(this.undoStack[this.undoStackIndex].model);
      this.model=peekModel;
    }
  }
  redo(){
    if(this.undoStackIndex<this.undoStack.length-1){
      this.undoStackIndex=this.undoStackIndex+1;
      let peekModel = _.cloneDeep(this.undoStack[this.undoStackIndex].model);
      this.model=peekModel;
    }
  }
  copy(){
    this.putSelectionOnClipboard()
  }
  paste(){
    if( this.clipBoard ){
      this.model.nodes.forEach(n=>n.selected=false)
      this.model.edges.forEach(e=>e.selected=false)
      let clip = _.cloneDeep(this.clipBoard)
      clip.nodes.forEach(n=>{
        let newId = nextId();
        let oldId = n.id;
        n.id = newId;
        clip.edges.forEach(e=>{
          if(e.sourceId==oldId) e.sourceId = newId;
          if(e.targetId==oldId) e.targetId = newId;
        })
      })
      clip.nodes.forEach(n=>{
        n.selected=true;
        this.model.nodes.push(n);
      })
      clip.edges.forEach(e=>{
        e.selected=true;
        this.model.edges.push(e);
      })
      this.postEdit("PASTE")
    }
  }
  cut(){
    this.putSelectionOnClipboard()
    this.delete();
  }
  delete(){
    const nodes :Array<WorkflowNode> = this.model.nodes.filter(n=>n.selected)
    const edges :Array<WorkflowEdge> = this.model.edges.filter(e=>e.selected)
    edges.forEach(e=>{
      let idx = this.model.edges.indexOf(e);
      if(idx != -1 ) this.model.edges.splice(idx,1) 
    })
    nodes.forEach(n=>{
      let idx = this.model.nodes.indexOf(n);
      if(idx != -1 ) this.model.nodes.splice(idx,1) 
    })
    const edgesToDelete = this.model.edges.filter(e=>!(this.model.nodes.find(n=>n.id==e.sourceId)&&this.model.nodes.find(n=>n.id==e.targetId)));
    edgesToDelete.forEach(e=>{
      let idx = this.model.edges.indexOf(e);
      if(idx != -1 ) this.model.edges.splice(idx,1)
    })
    this.postEdit("DELETE");
  }

  putSelectionOnClipboard(){
    const nodes :Array<WorkflowNode> = _.cloneDeep( this.model.nodes.filter(n=>n.selected))
    const edges :Array<WorkflowEdge> = _.cloneDeep( this.model.edges.filter(e=>e.selected))
    const edgesToDelete = edges.filter(e=>!(nodes.find(n=>n.id==e.sourceId)&&nodes.find(n=>n.id==e.targetId)));
    edgesToDelete.forEach(e=>{
      let idx = edges.indexOf(e);
      if(idx != -1 ) edges.splice(idx,1)
    })
    if(nodes.length!=0||edges.length!=0){
      this.clipBoard = new WorkflowModel(nodes,edges);
    }
  }
}

