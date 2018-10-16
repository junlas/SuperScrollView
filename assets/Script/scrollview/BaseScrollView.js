const { ccclass, property } = cc._decorator;

/**
 * 高效ScrollView组件
 * 
 * 注意事项：
 * 1. ScrollView 对应的条目 Item Cell Prefab，其挂在的脚本名称，需要与其名称一致;
 * 2. Item Cell prefab挂载的脚本中，需要实现方法: updateView(index, data){};
 * 3. 重点: 对于自下而上的排列，需要手动设置content Node和Item Cell Node的 anchorY=0，同理，自左而右，设置anchorX = 0;
 *          对于自上而下的排列，需要手动设置content Node和Item Cell Node的 anchorY=1，同理，自左而右，设置anchorX = 1;
 */
@ccclass
export default class BaseScrollView extends cc.ScrollView {

    /**@type {cc.Prefab} */
    @property(cc.Prefab || {tooltip: "条目单元格，暂不支持多条目"})
    cellItemPrefab = null;
    
    @property({ tooltip: "是否是垂直滚动" } || cc.Boolean)
    _horizontal = false;

    @property({ tooltip: "是否是垂直滚动",override: true})
    set horizontal(value) {
        this._horizontal = value;
        this._vertical = !value;
    }

    @property({ tooltip: "是否是垂直滚动" })
    get horizontal() {
        return this._horizontal;
    }

    @property({ tooltip: "是否是水平滚动" } || cc.Boolean)
    _vertical = true;

    @property({ tooltip: "是否是水平滚动",override: true})
    set vertical(value) {
        this._horizontal = !value;
        this._vertical = value;
    }

    @property({ tooltip: "是否是水平滚动" })
    get vertical() {
        return this._vertical;
    }
    @property({ tooltip: "间隔像素值" } || cc.Float)
    spacing = 10;
    /**@type {number} Item Cell 排列方向， 1:从下到上/从左到右；-1:从上到下/从右到左; */
    DirectItemSort = -1;
    /**@type {cc.Node[]} 存放 cell 的列表 */
    cellItemList = [];
    /**@type {cc.Size} cell 大小 */
    cellItemTempSize = null;
    /**@type {cc.Vec2} 滑动之前的 content 的位置 */
    lastContentPosition = cc.v2(0, 0);

    /**@type {any[]} */
    cellDatalist = [];

    /**@type {boolean} */
    isUpdateFrame = true;

    start() {
        this.content.on("position-changed", this._updateContentView.bind(this));
        this.initUI();
    }
    initUI() {
        // TODO 由子类继承，并实现
    }
    /** 初始化cellData的数据 */
    initCellDataList(/**@type {any[]} */cellDataList) {
        this.cellDatalist = cellDataList;
        if(this.content.anchorX == 0 || this.content.anchorY == 0) {
            this.DirectItemSort = 1;
        }else {
            this.DirectItemSort = -1;
        }
        this.createCellList();
    }
    /** 创建cell List列表 */
    createCellList() {
        if (this._vertical) {
            this._createVerticalCellList();
        } else {
            this._createHorizontalCellList();
        }
    }
    _createVerticalCellList() {
        let count = 10;
        for (let i = 0; i < this.cellDatalist.length; i++) {
            if (i > count - 1) {
                return;
            }
            let node = cc.instantiate(this.cellItemPrefab);
            if (i == 0) {
                this.cellItemTempSize = node.getContentSize();
                count = Math.ceil(this.node.height / node.height) * 2;
                let height = this.cellDatalist.length * (this.cellItemTempSize.height + this.spacing);
                this.content.setContentSize(cc.size(this.content.width, height));
            }
            node["cellID"] = i;
            this.content.addChild(node);
            this.cellItemList.push(node);
            let logicComponent = this.cellItemList[i].getComponent(this.cellItemPrefab.name);
            if (logicComponent && logicComponent.updateView) {
                logicComponent.updateView(i, this.cellDatalist[i]);
            }
            node.y = this.DirectItemSort * i * (this.cellItemTempSize.height + this.spacing);
        }
    }
    _createHorizontalCellList() {
        let count = 10;
        for (let i = 0; i < this.cellDatalist.length; i++) {
            if (i > count - 1) {
                return;
            }
            let node = cc.instantiate(this.cellItemPrefab);
            if (i == 0) {
                this.cellItemTempSize = node.getContentSize();
                count = Math.ceil(this.node.width / node.width) * 2;
                let width = this.cellDatalist.length * (this.cellItemTempSize.width + this.spacing);
                this.content.setContentSize(cc.size(width, this.content.height));
            }
            node["cellID"] = i;
            this.content.addChild(node);
            this.cellItemList.push(node);
            let logicComponent = this.cellItemList[i].getComponent(this.cellItemPrefab.name);
            if (logicComponent && logicComponent.updateView) {
                logicComponent.updateView(i, this.cellDatalist[i]);
            }
            node.x = (this.cellItemTempSize.width + this.spacing) * i;
        }
    }
    _getPositionInView(/**@type {cc.Node}*/item) {
        let worldPos = item.parent.convertToWorldSpaceAR(item.position);
        let viewPos = this.node.convertToNodeSpaceAR(worldPos);
        return viewPos;
    }
    _updateContentView() {
        if (this._vertical) {
            if (this.isUpdateFrame) {
                this.isUpdateFrame = false;
                this.scheduleOnce(this._updateVerticalContentView.bind(this), 0);
            }
        } else {
            if (this.isUpdateFrame) {
                this.isUpdateFrame = false;
                this.scheduleOnce(this._updateHorizontalContentView.bind(this), 0);
            }
        }
    }
    _updateVerticalContentView() {
        let isDown = this.content.y < this.lastContentPosition.y;
        let offsetSingleHeight = this.cellItemTempSize.height + this.spacing;
        let offsetTotalHeight = offsetSingleHeight * this.cellItemList.length;
        let offset = offsetTotalHeight / 4;
        let newY = 0;
        let minCellID = this.cellDatalist.length - 1;
        let maxCellID = 0;
        for (let i = 0; i < this.cellItemList.length && this.cellItemList.length < this.cellDatalist.length; i++) {
            let viewPos = this._getPositionInView(this.cellItemList[i]);
            let idx = this.cellItemList[0]["cellID"];
            if(idx < minCellID) minCellID = idx;
            idx = this.cellItemList[this.cellItemList.length-1]["cellID"];
            if(idx > maxCellID) maxCellID = idx;
            if(minCellID > maxCellID) {
                let temp = minCellID;
                minCellID = maxCellID;
                maxCellID = temp;
            }
            //--内容往下拉--//
            if (isDown) {
                //每滑动一块重复，判断是否到达最顶部，是：立即跳出循环，不在继续迭代;
                if(this.DirectItemSort == 1 && maxCellID >= this.cellDatalist.length - 1){
                    break;
                }
                //底部
                if(this.DirectItemSort == -1 && minCellID <= 0){
                    break;
                }
                newY = this.cellItemList[i].y + offsetTotalHeight;
                let targetY = (this.DirectItemSort == 1 ? -(offset * 3):-offset);
                if (viewPos.y < targetY) {
                    this.cellItemList[i].y = newY;
                    idx = this.cellItemList[i]["cellID"] + (this.DirectItemSort * this.cellItemList.length);
                    let logicComponent = this.cellItemList[i].getComponent(this.cellItemPrefab.name);
                    if (logicComponent && logicComponent.updateView) {
                        logicComponent.updateView(idx, this.cellDatalist[idx]);
                    }
                    if(idx < minCellID) minCellID = idx;
                    if(idx > maxCellID) maxCellID = idx;
                    this.cellItemList[i]["cellID"] = idx;
                }
            //--内容往上拉--//
            } else {
                //每滑动一块重复，判断是否到达最底部，是：立即跳出循环，不在继续迭代;
                if(this.DirectItemSort == 1 && minCellID <= 0){
                    break;
                }
                //顶部
                if(this.DirectItemSort == -1 && maxCellID >= this.cellDatalist.length - 1){
                    break;
                }
                newY = this.cellItemList[i].y - offsetTotalHeight;
                let targetY = (this.DirectItemSort == 1 ? offset:3*offset);
                if (viewPos.y > targetY) {
                    this.cellItemList[i].y = newY;
                    idx = this.cellItemList[i]["cellID"] - (this.DirectItemSort * this.cellItemList.length);
                    let logicComponent = this.cellItemList[i].getComponent(this.cellItemPrefab.name);
                    if (logicComponent && logicComponent.updateView) {
                        logicComponent.updateView(idx, this.cellDatalist[idx]);
                    }
                    if(idx < minCellID) minCellID = idx;
                    if(idx > maxCellID) maxCellID = idx;
                    this.cellItemList[i]["cellID"] = idx;
                }
            }
        }
        
        this.lastContentPosition = this.content.position;
        this.isUpdateFrame = true;
    }
    _updateHorizontalContentView() {
        let isLeft = this.content.x < this.lastContentPosition.x;
        let offsetX = (this.cellItemTempSize.width + this.spacing) * this.cellItemList.length;
        let offset = offsetX / 4;
        let newX = 0;
        for (let i = 0; i < this.cellItemList.length; i++) {
            let viewPos = this._getPositionInView(this.cellItemList[i]);
            if (isLeft) {
                newX = this.cellItemList[i].x + offsetX;
                if (viewPos.x < -offset && newX < this.content.width) {
                    this.cellItemList[i].x = newX;
                    let idx = this.cellItemList[i]["cellID"] + (this.DirectItemSort * this.cellItemList.length);
                    let logicComponent = this.cellItemList[i].getComponent(this.cellItemPrefab.name);
                    if (logicComponent && logicComponent.updateView) {
                        logicComponent.updateView(idx, this.cellDatalist[idx]);
                    }
                    this.cellItemList[i]["cellID"] = idx;
                }
            } else {
                newX = this.cellItemList[i].x - offsetX;
                if (viewPos.x > offset * 3 && newX >= 0) {
                    this.cellItemList[i].x = newX;
                    let idx = this.cellItemList[i]["cellID"] - (this.DirectItemSort * this.cellItemList.length);
                    let logicComponent = this.cellItemList[i].getComponent(this.cellItemPrefab.name);
                    if (logicComponent && logicComponent.updateView) {
                        logicComponent.updateView(idx, this.cellDatalist[idx]);
                    }
                    this.cellItemList[i]["cellID"] = idx;
                }
            }
        }
        this.lastContentPosition = this.content.position;
        this.isUpdateFrame = true;
    }


}
