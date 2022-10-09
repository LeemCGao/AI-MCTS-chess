import Cell from "./Cell";
import Node from "./Node";
import State from "./State";

class Game{
    constructor(boardWidth) {
        this.curColor = 1;
        this.boardWidth = boardWidth || 5;
        this.curState = new State({
            boardWidth: this.boardWidth,
            
        });
        this.curState.lastMove = new Cell(-1,-1,-1,null,null,this.curState,this.curState.xy2idx(-1,-1));
        this.node = new Node({
            state: this.curState
        });
        
    }

    //人机对弈
    placePiece(x,y,color){

        if(color===1){
            let state = this.checkPiece(x,y,color);
            if(state){
                this.curState = state;
                this.curColor = -this.curColor;

                //ai
                let node = this.node.getChild(x,y);
                if(!node){
                    node = new Node({
                        state: this.curState
                    });
                }
                for(let i=0; i<1000; i++){
                    node.runOnce();
                }
                let bestChild = node.getMaxNChild();
                if(bestChild){
                    // let cell = bestChild.state.lastMove;
                    this.curState = bestChild.state;
                    this.curColor = -this.curColor;
                    this.node = bestChild;
                }

            }
        }

    }

    //人人对弈
    placePiecePVP(x,y,color){
        let state = this.checkPiece(x,y,color);
        if(state){
            this.curState = state;
            this.curColor = -this.curColor;
        }
    }

    checkPiece(x,y,color){
        let state = this.curState.clone();
        let valid = state.placePiece(x,y,color);
        if(valid){
            return state;
        }else{
            return false;
        }
    }

}

export default Game;