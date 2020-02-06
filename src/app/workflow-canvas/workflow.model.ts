import { WorkflowCanvasComponent } from "./workflow-canvas.component";
import { Ptor } from "protractor";


export class UndoEntry{
    constructor(public desc:string,public model:WorkflowModel){}
  }
  
  export class WorkflowModel{
    constructor(public nodes : Array<WorkflowNode> = [], public edges : Array<WorkflowEdge> = [] ){
  
    }
  }
  
  export class Utils {
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
    static rectContainsPoint(rx:number, ry:number, rw:number, rh: number, x:number, y:number): boolean{
        return x >= rx && x <= (rx + rw) && y >= ry && y<(ry+rh)
    }
    static distanceBetweenPoints(x1:number, y1:number, x2:number, y2:number) :number{
      return Math.abs(Math.hypot((x2-x1),(y2-y1)))
    }
    static distanceFromLine(x1:number, y1:number, x2:number, y2:number,x:number, y:number) :number{

      let A = x - x1;
      let B = y - y1;
      let C = x2 - x1;
      let D = y2 - y1;
    
      let dot = A * C + B * D;
      let len_sq = C * C + D * D;
      let param = -1;
      if (len_sq != 0) //in case of 0 length line
          param = dot / len_sq;
    
      let xx, yy;
    
      if (param < 0) {
        xx = x1;
        yy = y1;
      }
      else if (param > 1) {
        xx = x2;
        yy = y2;
      }
      else {
        xx = x1 + param * C;
        yy = y1 + param * D;
      }
    
      let dx = x - xx;
      let dy = y - yy;
      return Math.sqrt(dx * dx + dy * dy);
    }
  }
  
  export enum Direction {
    UNKNOWN="0",
    NORTH="N", NORTH_EAST="NE", EAST="E", SOUTH_EAST="SE", SOUTH="S", SOUTH_WEST="SW", WEST="W", NORTH_WEST="NW"
  }
  
  export class DirectionalHit {
    constructor( public direction : Direction, public node: WorkflowNode, public x:number, public y:number ){}

    getHandleX():number {
      return this.node.getX(this.direction)
    }

    getHandleY():number {
      return this.node.getY(this.direction)
    }
  }
  
  const MIN_DIMENSION: number = 20
  
  var idGen = 0;
  export function nextId() : number {
    idGen = idGen + 1;
    return idGen;
  }
  
  export abstract class WorkflowNode {
  
    constructor(public id: number, public x:number, public y: number, public selected: boolean = true ){}
  
    abstract containsPoint(x:number,y:number):boolean
    abstract isInsideRect(x:number,y:number,w:number,h:number):boolean
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
    
    isSelected(canvas: WorkflowCanvasComponent):boolean{ 
      return this.selected && !canvas.isGroupSelecting(); 
    }
    isCanvasConnectionHit(canvas: WorkflowCanvasComponent,direction:Direction):boolean{ 
      return (canvas.getCurrentSourceConnectionHover() != null && canvas.getCurrentSourceConnectionHover().node == this && canvas.getCurrentSourceConnectionHover().direction==direction)  
      || (canvas.getCurrentTargetConnectionHover() != null && canvas.getCurrentTargetConnectionHover().node == this && canvas.getCurrentTargetConnectionHover().direction==direction)
      
    }
  
    showNorthConnection(canvas: WorkflowCanvasComponent): boolean {
      return this.isCanvasConnectionHit(canvas,Direction.NORTH);
    }
    showNorthEastConnection(canvas: WorkflowCanvasComponent): boolean {
      return this.isCanvasConnectionHit(canvas,Direction.NORTH_EAST);
    }
    showEastConnection(canvas: WorkflowCanvasComponent): boolean {
      return this.isCanvasConnectionHit(canvas,Direction.EAST);
    }
    showSouthEastConnection(canvas: WorkflowCanvasComponent): boolean {
      return this.isCanvasConnectionHit(canvas,Direction.SOUTH_EAST);
    }
    showSouthConnection(canvas: WorkflowCanvasComponent): boolean {
      return this.isCanvasConnectionHit(canvas,Direction.SOUTH);
    }
    showSouthWestConnection(canvas: WorkflowCanvasComponent): boolean {
      return this.isCanvasConnectionHit(canvas,Direction.SOUTH_WEST);
    }
    showWestConnection(canvas: WorkflowCanvasComponent): boolean {
      return this.isCanvasConnectionHit(canvas,Direction.WEST);
    }
    showNorthWestConnection(canvas: WorkflowCanvasComponent): boolean {
      return this.isCanvasConnectionHit(canvas,Direction.NORTH_WEST);
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

    moveBy(canvas: WorkflowCanvasComponent,dx:number,dy:number){
      this.x = this.x + dx;
      this.y = this.y + dy;

      canvas.model.edges.filter(e=>e.sourceId==this.id).forEach(e=>{
        e.junctions[0].x = e.junctions[0].x + dx;
        e.junctions[0].y = e.junctions[0].y + dy;
      })
      canvas.model.edges.filter(e=>e.targetId==this.id).forEach(e=>{
        e.junctions[e.junctions.length-1].x = e.junctions[e.junctions.length-1].x + dx;
        e.junctions[e.junctions.length-1].y = e.junctions[e.junctions.length-1].y + dy;
      })
    }
  }
  
  export class RectWorkflowNode extends WorkflowNode {
  
    constructor(x:number, y: number, public width: number, public height: number ){
      super(nextId(),x,y)
    }
  
    containsPoint(x:number,y:number):boolean{
      return Utils.rectContainsPoint(this.x,this.y,this.width,this.height,x,y)
    }
  
    isInsideRect(x:number,y:number,w:number,h:number):boolean{
      return this.x >= x && (this.x+this.width)<=x+w && this.y >= y && (this.y+this.height)<=y+h;
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
  
    constructor(x:number, y: number, public radius: number ){
      super(nextId(),x,y)
    }
  
    containsPoint(x:number,y:number):boolean{
      return Utils.cirleContainsPoint(this.x,this.y,this.radius,x,y)
    }
  
    isInsideRect(x:number,y:number,w:number,h:number):boolean{
      return x <= (this.x-this.radius) && x+w >= (this.x+this.radius) && y <= (this.y-this.radius) && y+h >= (this.y+this.radius)
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
  
    constructor(x:number, y: number, public width: number, public height: number ){
      super(nextId(), x,y)
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
  
    isInsideRect(x:number,y:number,w:number,h:number):boolean{
      let X = this.x-(this.width/2)
      let Y = this.y-(this.height/2)
      return X >= x && (X+this.width)<=x+w && Y >= y && (Y+this.height)<=y+h;
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
    MIN_CONN_LEN: number = 5;

    public sourceId: number = -1;; 
    public sourceDirection: Direction;
    public targetId: number = -1;; 
    public targetDirection: Direction;
    public selected : boolean;
    public junctions: Array<Point> = [];

    constructor( sourceHit:DirectionalHit ){
      this.sourceId = sourceHit.node.id;
      this.sourceDirection = sourceHit.direction;
      let x = sourceHit.node.getX(sourceHit.direction);
      let y = sourceHit.node.getY(sourceHit.direction);
      this.junctions.push(new Point(x,y));
    }

    connect(canvas:WorkflowCanvasComponent,targetHit:DirectionalHit){
      this.targetId = targetHit.node.id;
      this.targetDirection = targetHit.direction;
      this.junctions.pop();
      let target = canvas.model.nodes.find(n=>n.id == this.targetId)
      let x0 = target.getX(this.targetDirection);
      let y0 = target.getY(this.targetDirection);
      if(this.targetDirection===Direction.NORTH) this.junctions.push(new Point(x0,y0-MIN_DIMENSION))
      else if(this.targetDirection===Direction.EAST) this.junctions.push(new Point(x0+MIN_DIMENSION,y0))
      else if(this.targetDirection===Direction.SOUTH) this.junctions.push(new Point(x0,y0+MIN_DIMENSION))
      else this.junctions.push(new Point(x0-MIN_DIMENSION,y0))
    }

    isConnected():boolean{
      return this.sourceId != -1 && this.targetId != -1;
    }
    
    isInsideRect(canvas:WorkflowCanvasComponent,x:number,y:number,w:number,h:number):boolean{
      let b = true;

      let source = canvas.model.nodes.find(n=>n.id == this.sourceId)
      let x0 = source.getX(this.sourceDirection);
      let y0 = source.getY(this.sourceDirection);
      if(!Utils.rectContainsPoint(x,y,w,h,x0,y0)) b = false;

      if(b){
        this.junctions.forEach(j=>{
          if(!Utils.rectContainsPoint(x,y,w,h,j.x,j.y)){
            b = false;
          } 
        })
      }

      if(b){
        let target = canvas.model.nodes.find(n=>n.id == this.targetId)
        if(target){
          x0 = target.getX(this.targetDirection);
          y0 = target.getY(this.targetDirection);
          if(!Utils.rectContainsPoint(x,y,w,h,x0,y0)) b = false;
        }
      }

      return b;
    }

    containsPoint(canvas:WorkflowCanvasComponent,x:number,y:number):boolean{

      let b = false;

      this.junctions.forEach((j,i)=>{
        if( i == 0 ){
          let source = canvas.model.nodes.find(n=>n.id == this.sourceId)
          let x0 = source.getX(this.sourceDirection);
          let y0 = source.getY(this.sourceDirection);
          if(this.lineContainsPoint(x0,y0,j.x,j.y,x,y)) b = true;
        }
        else {
          let x0 = this.junctions[i-1].x;
          let y0 = this.junctions[i-1].y;
          if(this.lineContainsPoint(x0,y0,j.x,j.y,x,y)) b = true;
        }
      })
      let target = canvas.model.nodes.find(n=>n.id == this.sourceId)
      if(!b ){
        let target = canvas.model.nodes.find(n=>n.id == this.sourceId)
        if(target){
          let x0 = target.getX(this.sourceDirection);
          let y0 = target.getY(this.sourceDirection);
          let x1 = this.junctions[this.junctions.length-1].x;
          let y1 = this.junctions[this.junctions.length-1].y;
          if(this.lineContainsPoint(x0,y0,x1,y1,x,y)) b = true;
        }
      }

      return b;
    }

    lineContainsPoint(x0:number,y0:number,x1:number,y1:number,x:number,y:number):boolean{
        
        let d = Utils.distanceFromLine(x0,y0,x1,y1,x,y)

        let d0 = Utils.distanceBetweenPoints(x0,y0,x1,y1)
        let d1 = Utils.distanceBetweenPoints(x0,y0,x,y)
        let d2 = Utils.distanceBetweenPoints(x,y,x1,y1)

        return d<2 && d1<=d0 && d2<=d0
    }

    calculateConnectingPathOnDrag(canvas:WorkflowCanvasComponent,x:number,y:number,dx:number,dy:number ){

      // let pt : Point = this.junctions[this.junctions.length-1];
      // pt.x = x;
      // pt.y = y;

      let source = canvas.model.nodes.find(n=>n.id == this.sourceId)
      let x0 = source.getX(this.sourceDirection);
      let y0 = source.getY(this.sourceDirection);
        
      this.junctions = [];

      if(this.sourceDirection===Direction.NORTH) this.junctions.push(new Point(x0,y0-MIN_DIMENSION))
      else if(this.sourceDirection===Direction.EAST) this.junctions.push(new Point(x0+MIN_DIMENSION,y0))
      else if(this.sourceDirection===Direction.SOUTH) this.junctions.push(new Point(x0,y0+MIN_DIMENSION))
      else this.junctions.push(new Point(x0-MIN_DIMENSION,y0))
      this.junctions.push(new Point(x,y))

      if( Math.abs(dy) > Math.abs(dx)){
        if( dy > 0){ // moving coord north - down the page
          if(this.sourceDirection===Direction.NORTH){
            // this.junctions.push(new Point(x0,y0-MIN_DIMENSION))
            // this.junctions.push(new Point(x,y))
            if( x >= x0 ){
              if( y >= y0-this.MIN_CONN_LEN){
                //    ___
                //   |   |
                //  src  |
                //
              }
              else{
                //    ___|
                //   |
                //  src  
                //
              }
            }
            else
            {
              if( y >= y0-this.MIN_CONN_LEN){
                //    ___
                //   |   |
                //   |  src
                //
              }
              else{
                //   |___
                //       |
                //      src  
                //
              }
            }
          }
          else if(this.sourceDirection===Direction.EAST){
            if( y >= y0 ){
              if( x >= x0+this.MIN_CONN_LEN){
                //   src--|
                //        |
                //     
              }
              else{
                //     src--|
                //    ______|
                //   | 
              }
            }
            else
            {
              if( x >= x0+this.MIN_CONN_LEN){
                //        
                //       |
                //  src--|
              }
              else{
                //  |______
                //         |
                //    src--|
              }
            }
          }
          else if(this.sourceDirection===Direction.SOUTH){
            if( x >= x0 ){
              if( y >= y0+this.MIN_CONN_LEN){
                //   src
                //    |__
                //       |
              }
              else{
                //   
                //  src  |
                //   |___|
                //    
              }
            }
            else
            {
              if( y >= y0+this.MIN_CONN_LEN){
                //   
                //      src
                //     __|
                //    |
              }
              else{
                //   |  src
                //   |___|   
                //       
                //
              }
            }
          }
          else{
            if( y >= y0 ){
              if( x >= x0-this.MIN_CONN_LEN){
                //   |---src
                //   |_____
                //         |
              }
              else{
                //      ___src
                //     |   
                // 
              }
            }
            else
            {
              if( x >= x0-this.MIN_CONN_LEN){
                //   ______|   
                //  |
                //  |___src
              }
              else{
                //   
                //   |
                //   |____src
              }
            }
          }
        }
        else{ // moving coord south - up the page
          if(this.sourceDirection===Direction.NORTH){

          }
          else if(this.sourceDirection===Direction.EAST){
            
          }
          else if(this.sourceDirection===Direction.SOUTH){
            
          }
          else{
            
          }
        }
      }
      else{
        if( dx > 0){ // moving coord east - to page right
          if(this.sourceDirection===Direction.NORTH){

          }
          else if(this.sourceDirection===Direction.EAST){
            
          }
          else if(this.sourceDirection===Direction.SOUTH){
            
          }
          else{
            
          }
        }
        else{ // moving coord west - to page left
          if(this.sourceDirection===Direction.NORTH){

          }
          else if(this.sourceDirection===Direction.EAST){
            
          }
          else if(this.sourceDirection===Direction.SOUTH){
            
          }
          else{
            
          }
        }
      }
    }

    getSourceX(canvas:WorkflowCanvasComponent):number{
      const source = canvas.model.nodes.find(n=>n.id == this.sourceId)
      return source.getX(this.sourceDirection);
    }
    getSourceY(canvas:WorkflowCanvasComponent):number{
      const source = canvas.model.nodes.find(n=>n.id == this.sourceId)
      return source.getY(this.sourceDirection);
    }
    getTargetX(canvas:WorkflowCanvasComponent):number{
      const target = canvas.model.nodes.find(n=>n.id == this.targetId)
      return target.getX(this.targetDirection);
    }
    getTargetY(canvas:WorkflowCanvasComponent):number{
      const target = canvas.model.nodes.find(n=>n.id == this.targetId)
      return target.getY(this.targetDirection); 
    }

    isSelected(canvas: WorkflowCanvasComponent):boolean{ 
      return this.selected && !canvas.isGroupSelecting(); 
    }
  }

  export class Point{
    constructor(public x:number,public y:number){}
  }

  

  