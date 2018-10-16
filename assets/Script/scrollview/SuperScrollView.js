import BaseScrollView from './BaseScrollView';

const {ccclass, property} = cc._decorator;

@ccclass
export default class SuperScrollView extends BaseScrollView {

    onLoad() {
        let scrollCount = 4;
        let data = [];
        for (let i = 0; i < scrollCount; i++) {
            data.push(i);
        }
        this.initCellDataList(data);
    }

    
}