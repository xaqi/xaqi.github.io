var baseUrl = "/api/map/" + mapId + "/";

Ext.define("KMap.store.NodeStore", {
    extend: 'Ext.data.TreeStore',
    proxy: {
        type: 'ajax',
        url: baseUrl + '/gettreenode',
        reader: 'json',
        autoLoad: true
    },
    fields: [{
        name: 'id',
        type: 'string'
    }, {
        name: 'name',
        type: 'string'
    }]

});

Ext.define("KMap.treegrid", {
    extend: "Ext.tree.Panel",
    alias: "widget.treegrid",
    columnLines: true,
    root: {
        id: rootId,
        name: rootName,
        expanded: true
    },
    columns: [{
        xtype: 'treecolumn',
        header: '节点名称', dataIndex: 'name', sortable: false, width: 350
    }],
    loadMask: {
        msg: '正在加载数据,请稍等...'
    },
    store: Ext.create('KMap.store.NodeStore')
});

var loadMap = function (id) {
    if (!window.editor) return;
    $.ajax({
        type: "GET",
        url: baseUrl + id + "/getmap",
        success: function (data) {
            window.editor.minder.importJson(data);
            //window.editor.minder.execCommand('ExpandToLevel', 4);
            window.editor.minder.execCommand('ExpandToLevel', 6);
        }
    });
};

Ext.onReady(function () {

    window.tree = Ext.create('KMap.treegrid', {
        width: 200,
        region: 'west',
        collapsible: true,
        split: true
    });
    var map = {
        region: 'center',
        html: '<div ng-app="kityminderDemo" ng-controller="MainController"><kityminder-editor on-init="initEditor(editor, minder)"></kityminder-editor></div>'
    };
    Ext.create('Ext.container.Viewport', {
        layout: 'border',
        items: [tree, map]
    });

    page('/map/:mapId/:nodeId', function (data) {
        var nodeId = data.params.nodeId;
        loadMap(nodeId);
    });
    page();

    tree.addListener('rowclick', function (grid, rowindex, e) {
        var model = tree.getSelectionModel();
        var selectedItem = model.selected.items[0];
        if (selectedItem && selectedItem.data.id) {
            var nodeId = selectedItem.data.id;
            page('/map/' + mapId + "/" + nodeId);
            //loadMap(selectedItem.data.id);
        }
    });
});



angular.module('kityminderEditor').run(['$templateCache', function ($templateCache) {
    'use strict';
    var topTabHtml = $templateCache.get('ui/directive/topTab/topTab.html');
    topTabHtml = topTabHtml.replace('<undo-redo', '<btn-save></btn-save><undo-redo');
    $templateCache.put('ui/directive/topTab/topTab.html', topTabHtml);
    $templateCache.put('ui/directive/btnSave/btnSave.html', "<div>btnSave</div>");

    $templateCache.put('ui/directive/btnSave/btnSave.html',
        "<div class=\"km-btn-group operation-group\">" +
        "<div class=\"km-btn-item edit-node\" ng-click=\"saveNode()\" title=\"保存\">" +
        "<i class=\"km-btn-icon\"></i> <span class=\"km-btn-caption\">保存</span></div>" +
        "<div class=\"km-btn-item remove-node\" ng-click=\"loadNode();\" title=\"load\">" +
        "<i class=\"km-btn-icon\"></i> <span class=\"km-btn-caption\">load</span></div></div>"
    );
}]);

angular.module('kityminderEditor')
    .directive('btnSave', function () {
        return {
            templateUrl: 'ui/directive/btnSave/btnSave.html',
            controller: ["$scope", function ($scope) {
                $scope.saveNode = function () {
                    var data = window.editor.minder.exportJson();
                    $.ajax({
                        type: "POST",
                        url: baseUrl + rootId + "/save",
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(data),
                        dataType: "json",
                        success: function (message) {
                            if (!window.tree) return;
                            //var path = tree.getSelectionModel().getSelectedNode().getPath('id');
                            //tree.getLoader().load(tree.getRootNode(), function (treeNode) {
                            //    tree.expandPath(path, 'id', function (bSucess, oLastNode) {
                            //        tree.getSelectionModel().select(oLastNode);
                            //    });
                            //}, this);   
                            tree.store.load();
                        }
                    });
                };
                $scope.loadNode = function () {
                    var json = { "root": { "data": { "id": "bsdue5233qw0", "created": 1551617199428, "text": "中心主题" }, "children": [{ "data": { "id": "bsdue95xwko0", "created": 1551617208369, "text": "分支主题", "hyperlink": "http://www.baidu.com", "hyperlinkTitle": "" }, "children": [{ "data": { "id": "bsduejw2ay00", "created": 1551617231716, "text": "ccd" }, "children": [] }, { "data": { "id": "bsduen2ti2g0", "created": 1551617238655, "text": "分支主题", "priority": 1 }, "children": [] }, { "data": { "id": "bsduengd4080", "created": 1551617239474, "text": "分支主题", "note": "xxafewfw" }, "children": [] }, { "data": { "id": "bsduenv8cmo0", "created": 1551617240373, "text": "分支主题", "progress": 6, "priority": 8, "font-weight": "bold", "font-style": "italic", "color": "#00b050", "background": "#1f497d", "font-size": 24, "font-family": "隶书, SimLi" }, "children": [] }] }, { "data": { "id": "bsdue9izw0g0", "created": 1551617209158, "text": "分支主题" }, "children": [{ "data": { "id": "bsduekccf940", "created": 1551617232701, "text": "zzf" }, "children": [] }, { "data": { "id": "bsdueoit6u00", "created": 1551617241799, "text": "bbd" }, "children": [] }, { "data": { "id": "bsduepyx6ns0", "created": 1551617244950, "text": "feea" }, "children": [] }] }, { "data": { "id": "bsdue9w658w0", "created": 1551617209955, "text": "分支主题" }, "children": [{ "data": { "id": "bsduedxu8ug0", "created": 1551617218763, "text": "xx", "layout_left_offset": { "x": 77, "y": -112 } }, "children": [] }, { "data": { "id": "bsduegz57680", "created": 1551617225372, "text": "yy", "layout_left_offset": { "x": 286, "y": 78 } }, "children": [] }, { "data": { "id": "bsdueri25wg0", "created": 1551617248284, "text": "fds" }, "children": [] }] }] }, "template": "default", "theme": "fresh-purple-compat", "version": "1.4.43" };
                    window.editor.minder.importJson(json);
                };
            }]
        };
    });

angular.module('kityminderDemo', ['kityminderEditor'])
    .config(function (configProvider) {
        configProvider.set('imageUpload', '../server/imageUpload.php');
    })
    .controller('MainController', function ($scope) {
        $scope.initEditor = function (editor, minder) {
            window.editor = editor;
            window.minder = minder;
            loadMap(nodeId);
        };
    });