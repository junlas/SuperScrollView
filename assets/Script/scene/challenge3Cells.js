import BaseCell from "../scrollview/BaseCell";

const {ccclass, property} = cc._decorator;

@ccclass
export default class challenge3Cells extends BaseCell {

    /**@type {cc.Label} */
    @property(cc.Label)
    lblCell = null;

    updateView(idx, data) {
        cc.log(`[updateView]idx:${idx};        data:${data}`);
        this.lblCell.string = idx;

    }

}