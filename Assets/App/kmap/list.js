var createList = function (tableName, config) {

    Ext.define(tableName, {
        extend: 'Ext.data.Model',
        fields: ["id", "name", "userid"]
    });
    var store = Ext.create('Ext.data.Store', {
        model: tableName,
        autoLoad: true,
        remoteSort: true,
        proxy: {
            type: 'ajax',
            url: '/api/kmap/get' + tableName + 's',
            reader: {
                type: 'json',
                totalProperty: 'count',
                rootProperty: 'rows'
            }
        },
        sorters: { property: 'name', direction: 'ASC' }
    });

    var grid = null;

    var gridConfig = {
        title: tableName + 's',
        region: 'center',
        store: store,
        viewConfig: {
            stripeRows: false
        },
        dockedItems: [{
            xtype: 'pagingtoolbar',
            store: store,
            dock: 'bottom',
            displayInfo: true
        }],
        tbar: [{
            xtype: 'button', text: 'Add', iconCls: 'icon-plus green',
            listeners: {
                click: function () { grid.addClick.apply(this, arguments); }
            }
        }],
        columns: [{
            header: 'Name',
            hideable: false,
            //flex: 1,
            width: 200,
            sortable: true,
            dataIndex: 'name',
            renderer: tableName === "user" ? null : function (data, metadata, record, rowIndex, columnIndex, store) {
                var id = store.getAt(rowIndex).get('id');
                var name = store.getAt(rowIndex).get('name');
                return '<a href="/' + tableName + '/' + id + '" target="_blank">' + name + '</a>';
            }
        }, {
            xtype: 'actioncolumn',
            width: 50,
            menuDisabled: true,
            sortable: false,

            items: [{
                iconCls: 'icon-edit green',
                handler: function () { grid.editClick.apply(this, arguments); }
            }, {
                iconCls: 'icon-remove red',
                handler: function () { grid.removeClick.apply(this, arguments); }
            }]
        }]
    };

    if (config) Ext.apply(gridConfig, config);

    grid = Ext.create('Ext.grid.Panel', gridConfig);

    grid.addClick = function () {
        grid.editClick(grid, null);
    };
    grid.editClick = function (grid, rowIndex, colIndex) {
        var rec;
        if (rowIndex != null) rec = store.getAt(rowIndex);

        var userId = null;
        if (tableName == "map") {
            var userGrid = grid.up("viewport").down("grid");
            var model = userGrid.getSelectionModel();
            var selectedItem = model.selected.items[0];
            if (selectedItem && selectedItem.data.id) {
                userId = selectedItem.data.id;
            }
            else {
                Ext.Msg.alert('Success', '请先选择用户');
                return;
            }
        }

        var form1 = Ext.create('Ext.form.Panel', {
            width: 300,
            //method: 'POST',
            layout: 'anchor',
            title: tableName + (rec ? ' edit' : ' add'),
            items: [{
                xtype: 'hidden',
                name: 'id'
            }, {
                xtype: 'hidden',
                name: 'userid'
            }, {
                fieldLabel: 'Name',
                xtype: 'textfield',
                name: 'name',
                allowBlank: false,
                anchor: '95%'
            }],
            bbar: [{
                xtype: 'tbfill'
            }, {
                xtype: 'button',
                text: '确定',
                disabled: true,
                formBind: true
            }, {
                xtype: 'button',
                text: '关闭',
                listeners: {
                    click: function () { window1.close(); }
                }
            }, {
                xtype: 'tbfill'
            }]
        });
        window.form1 = form1;
        if (rec) {
            form1.loadRecord(rec);
        }

        var window1 = Ext.create('Ext.window.Window', {
            renderTo: Ext.getBody(),
            header: false,
            border: false,
            resizable: false,
            width: 300,
            items: [form1]
        });
        window1.show();


        if (userId) form1.form.findField("userid").setValue(userId);
        form1.form.findField("name").focus();
        var btn = form1.down('button[text=确定]');
        btn.addListener('click', function () {
            var thisForm = form1.getForm();
            thisForm.submit({
                url: '/api/kmap/' + tableName + '/save',
                success: function (form, action) {
                    store.reload();
                    window1.close();
                }
            });
        });
    };

    grid.removeClick = function (grid, rowIndex, colIndex) {
        var rec = store.getAt(rowIndex);
        var id = rec.get('id');

        Ext.Msg.confirm('提示信息', '确认要删除这条信息吗？', function (op) {
            if (op != 'yes') return;
            Ext.Ajax.request({
                url: '/api/kmap/' + tableName + '/delete',
                method: 'POST',
                waitMsg: '正在提交数据...',
                waitTitle: '提示',
                params: { id: id },
                success: function (response) {
                    var data = Ext.decode(response.responseText);
                    console.log(data.msg);
                    store.load();
                },
                failure: function () {
                    Ext.Msg.alert("tip", "fail");
                }
            });
        });
    };
    return grid;
};

Ext.onReady(function () {

    var userGrid = createList('user', {
        width: 260,
        region: 'west',
        collapsible: true,
        split: true,
        dockedItems: []
    });
    var mapGrid = createList('map', {
        region: 'center'
    });
    Ext.create('Ext.container.Viewport', {
        layout: 'border',
        items: [userGrid, mapGrid]
    });

    userGrid.on('rowclick', function (grid, rowindex, e) {
        var model = userGrid.getSelectionModel();
        var selectedItem = model.selected.items[0];
        if (selectedItem && selectedItem.data.id) {
            var userId = selectedItem.data.id;
            mapGrid.store.getProxy().extraParams.userId = userId;
            mapGrid.store.load();
        }
    });
});
