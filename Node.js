//mcts的节点

import Cell from "./Cell";

class Node{
    constructor(param){
        this.father = param.father;
        this.ucb = Infinity;
        this.Q = 0;
        this.N = 0;
        this.children = [];
        this.maxUCBChild = null;
        this.state = param.state;
    }

    runOnce(){
        let selectedNode = this;

        while(selectedNode.children.length>0){
            selectedNode = selectedNode.setMaxUCBChild();
        }

        if(selectedNode.N>0){
            if(selectedNode.end){
                this.backpropagation(selectedNode.winColor, selectedNode);
                return;
            }
            selectedNode.createChildren();
            if(selectedNode.end){
                this.backpropagation(selectedNode.winColor, selectedNode);
                return;
            }
            selectedNode = selectedNode.children[0];
        }

        let winColor = selectedNode.simulate();
        let node = selectedNode;

        this.backpropagation(winColor, node);
        
    }

    backpropagation(winColor, node){
        do{
            node.updateQN(winColor);
            node = node.father;
        }while(node);
    }

    updateQN(winColor){
        this.N++;
        if(winColor===this.state.lastMove.color){
            this.Q++;
        }
    }

    setMaxUCBChild(){
        let max = -Infinity;
        for(let idx in this.children){
            let ucb = this.children[idx].updateUCB();
            if(ucb>max){
                max = ucb;
                this.maxUCBChild = this.children[idx];
            }
        }
        return this.maxUCBChild;
    }

    getMaxNChild(){
        let max = -Infinity;
        let best;
        for(let idx in this.children){
            let N = this.children[idx].N;
            if(N>max){
                max = N;
                best = this.children[idx];
            }else if(N===max){
                if(this.children[idx].Q>best.Q){
                    max = N;
                    best = this.children[idx];
                }
            }
        }
        return best;
    }

    createChildren(){
        let color = -this.state.lastMove.color;
        for(let x=0; x<this.state.boardWidth; x++){
            for(let y=0; y<this.state.boardWidth; y++){
                let idx = this.state.xy2idx(x,y);
                if(!this.state.cellMap[idx]){
                    let state = this.state.checkPiece(x,y,color);
                    if(state){
                        let node = new Node({
                            state: state,
                            father: this,
                        });
                        this.children.push(node);
                    }
                    
                }
            }
        }

        if(this.children.length===0){
            if(this.state.lastMove.x===-1){
                this.end = true;
            }else{
                let idx = this.state.xy2idx(-1,-1);
                let state = this.state.clone();
                let cell = new Cell(-1, -1, color, null, null, state, idx);
                state.lastMove = cell;
                let node = new Node({
                    state: state,
                    father: this,
                });
                this.children.push(node);
            }
        }
    }

    simulate(){
        let lastX;
        let end = false;
        let state = this.state;
        do{

            let color = -state.lastMove.color;
            let normalMove = [];
            // let fillEyeMove = [];
            let oneQiMove = [];
            for(let x=0; x<state.boardWidth; x++){
                for(let y=0; y<state.boardWidth; y++){
                    let idx = state.xy2idx(x,y);
                    if(!state.cellMap[idx]){
                        let checkRes = state.checkPiece(x,y,color);
                        if(checkRes){
                            if(checkRes.result === 1){
                                normalMove.push(checkRes);
                            }else if(checkRes.result === 2){
                                // fillEyeMove.push(checkRes);
                            }else if(checkRes.result === 3){
                                oneQiMove.push(checkRes);
                            }

                        }
                        
                    }
                }
            }

            let allMove = normalMove.concat(oneQiMove);
            if(normalMove.length===0){

                let idx = state.xy2idx(-1,-1);
                let state1 = state.clone();
                let cell = new Cell(-1, -1, color, null, null, state1, idx);
                state1.lastMove = cell;
                allMove.push(state1);
            }

            let selectIdx = this.getRandomInt(allMove.length);

            let selected = allMove[selectIdx];

            if(selected.lastMove.x === -1){
                if(lastX === -1){
                    end = true;
                }
            }
            lastX = selected.lastMove.x;

            state = selected;
        }while(!end);

        let winColor = this.getWinColor(state);

        this.winColor = winColor;
        return winColor;

    }

    getWinColor(state){
        let black = 0;
        let white = 0;

        let blackQi = {};
        let whiteQi = {};

        let blocks = state.blocks;
        for(let i=0; i<blocks.length; i++){
            let ziCount = blocks[i].getCount();

            if(blocks[i].color === 1){
                black += ziCount;
                for(let idx in blocks[i].qi){
                    blackQi[idx] = true;
                }
            }else{
                white += ziCount;
                for(let idx in blocks[i].qi){
                    whiteQi[idx] = true;
                }
            }
        }

        let blackQiCount = 0;
        let whiteQiCount = 0;
        for(let k in blackQi){
            blackQiCount ++;
        }
        for(let k in whiteQi){
            whiteQiCount ++;
        }
        black += blackQiCount;
        white += whiteQiCount;

        if(black>white){
            return 1;
        }else{
            return -1;
        }
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * max);
      }

    updateUCB(){
        if(this.N===0){
            return Infinity;
        }
        this.ucb = this.Q/this.N + Math.sqrt(2*Math.log(this.father.N)/this.N);
        return this.ucb;
    }

    getChild(x,y){
        for(let idx in this.children){
            let lastMove = this.children[idx].state.lastMove;
            if(lastMove.x===x&&lastMove.y===y){
                return this.children[idx];
            }
        }
    }
}

export default Node;