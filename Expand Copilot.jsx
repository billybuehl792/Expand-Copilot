/*
    Expand Copilot.jsx v.0.0
    Add and remove prebuilt animations/presets
*/

(function expandCopilot (thisObj) {

    /* App Configuration */
    var presetLib = new Folder(File($.fileName).path + '/Expand\ Presets/');
    var autoEase = {name: 'AutoEase', preset: new File(presetLib.absoluteURI + '/AutoEase.ffx')};
    var textAnimations = getPresets(new Folder(presetLib.absoluteURI + '/Text\ Animations/'));

    newPanel(thisObj);

    /* UI PANEL */
    function newPanel(thisObj) {

        var win = (thisObj instanceof Panel) ? thisObj : new Window('palette', 'Expand Copilot', undefined);
        
        // AutoEase Group
        var autoEaseGroup = win.add('group', undefined);
        var autoEaseApplyBTN = autoEaseGroup.add('button', undefined, 'Apply AutoEase');
        var autoEaseRemoveBTN = autoEaseGroup.add('button', undefined, 'Remove AutoEase');

        autoEaseApplyBTN.onClick = function() {
            togglePreset(true, autoEase.name, autoEase.preset)
        }
        autoEaseRemoveBTN.onClick = function() {
            togglePreset(false, autoEase.name, autoEase.preset);
        }

        // Tabs
        var tabPanel = win.add('tabbedpanel');
        var textAnimTab = tabPanel.add('tab', undefined, 'Text Animations');
        var layerAnimTab = tabPanel.add('tab', undefined, 'Layer Animations');
        var graphicsTab = tabPanel.add('tab', undefined, 'Graphics');
        var utilTab = tabPanel.add('tab', undefined, 'Utility');

        var textAnimDropdown = textAnimTab.add('dropdownlist', undefined, []);
        for (var i=0; i<textAnimations.length; i++) {
            textAnimDropdown.add('item', textAnimations[i].name);
        }
        textAnimDropdown.selection = 0;

        var animatorTypeDropdown = textAnimTab.add('dropdownlist', undefined, ['Characters', 'Chars Excluding Spaces', 'Words', 'Lines']);
        animatorTypeDropdown.selection = 3;

        var autoTextOnApplyBTN = textAnimTab.add('button', undefined, 'Apply AutoText On');
        var autoTextOnRemoveBTN = textAnimTab.add('button', undefined, 'Remove AutoText On');
        var autoTextOffApplyBTN = textAnimTab.add('button', undefined, 'Apply AutoText Off');
        var autoTextOffRemoveBTN = textAnimTab.add('button', undefined, 'Remove AutoText Off');

        
        autoTextOnApplyBTN.onClick = function() {

            for (var i=0; i<textAnimations.length; i++) {
                if (textAnimations[i].name == textAnimDropdown.selection.toString()) {
                    var name = textAnimations[i].name.split(' - ')[0] + ' On';
                    togglePreset(true, name, textAnimations[i].preset.on);
                    


                }
            }

        }

        autoTextOffApplyBTN.onClick = function() {
            for (var i=0; i<textAnimations.length; i++) {
                if (textAnimations[i].name == textAnimDropdown.selection.toString()) {
                    var name = textAnimations[i].name.split(' - ')[0] + ' Off';
                    togglePreset(true, name, textAnimations[i].preset.off);
                }
            }
        }

        autoTextOnRemoveBTN.onClick = function() {
            for (var i=0; i<textAnimations.length; i++) {
                if (textAnimations[i].name == textAnimDropdown.selection.toString()) {
                    var name = textAnimations[i].name.split(' - ')[0] + ' On';
                    togglePreset(false, name, textAnimations[i].preset.on);
                }
            }
        }

        autoTextOffRemoveBTN.onClick = function() {
            for (var i=0; i<textAnimations.length; i++) {
                if (textAnimations[i].name == textAnimDropdown.selection.toString()) {
                    var name = textAnimations[i].name.split(' - ')[0] + ' Off';
                    togglePreset(false, name, textAnimations[i].preset.off);
                }
            }
        }

        // Utility Tab
        var btn1 = utilTab.add('button', undefined, 'List push');
        var btn2 = utilTab.add('button', undefined, 'delete layer comment');
        var btn3 = utilTab.add('button', undefined, 'Test Button');
        
        btn1.onClick = function() {
            // alert('Test!!'.reflect.methods);
            var l1 = ['test', 'l1'];
            var l2 = ['hello', 'blah'];

            alert(l1.concat(l2))
        }
        btn2.onClick = function() {
            app.project.activeItem.selectedLayers[0].comment = "";
        }
        btn3.onClick = function() {
            alert(textAnimations.length);
        }

        // Panel Settings
        win.onResizing = win.onResize = function () {
            this.layout.resize();
        };
        win instanceof Window
            ? (win.center(), win.show()) : (win.layout.layout(true), win.layout.resize());

    }


    /* ----- Utility Functions ----- */

    function replaceAll(str, find, replace) {
        // return string with all instances of another string replaced
        return str.replace(new RegExp(find, 'g'), replace);
    }

    function isFFX(file) {
        if (file.displayName.split(".")[1] == 'ffx') {
            return true;
        } else {
            return false;
        }
    }

    function getPresets(folder) {

        // Return object of {name: <>, preset: "" or {}}

        var presets = [];
        var files = folder.getFiles();

        for (var i=0; i<files.length; i++) {

            // if Folder: search folder for _on and _off 
            if (files[i] instanceof Folder) {
                
                var nestedFiles = files[i].getFiles();
                var p = {name: files[i].displayName, preset: {}};

                for (var f=0; f<nestedFiles.length; f++) {
                    
                    if (nestedFiles[f].displayName.search('_on') > 0 && isFFX(nestedFiles[f]) ) {
                        p.preset.on = nestedFiles[f];
                    } else if (nestedFiles[f].displayName.search('_off') > 0 && isFFX(nestedFiles[f])) {
                        p.preset.off = nestedFiles[f];
                    }

                }

                presets.push(p);

            // if ffx file: append to presets[]
            } else if (isFFX(files[i])) {

                presets.push({
                    name: files[i].displayName.split(".")[0],
                    preset: files[i]
                });

            }
        }

        return presets;
        
    }

    function removeProp(prop) {

        try {
            prop.remove();
        } catch(err) {
            return false;
        }

        return true;
    }

    function getProperty(item, string, depth) {
        // return first instance of property in layer
        // if propName in property : propName | else : false

        if (depth <= 0) {
            return false;
        }

        for (var i=1; i<=item.numProperties; i++) {

            var propName = replaceAll(item.property(i).name.toLowerCase(), ' ', '');
            var pName = replaceAll(string.toLowerCase(), ' ', '');

            if (propName.search(pName) >= 0) {
                return item.property(i);
            } else {
                var r = getProperty(item.property(i), pName, depth-1);
                if (r) {
                    return r;
                }
            }

        }

        return false;

    }

    /* ----- Preset Functions ----- */

    function removePreset(layer, presetName) {

        var prop;
        
        while(true) {

            var prop = getProperty(layer, presetName, 3);

            if (prop) {
                removeProp(prop);
            } else {
                break;
            }
            
        }

    }

    function togglePreset(mode, name, preset) {

        // if mode : apply preset | else : remove all properties with presetName in name

        var activeLayers = app.project.activeItem.selectedLayers;

        // Remove preset from layer
        for (var i=0; i<activeLayers.length; i++) {
            removePreset(activeLayers[i], name);
            activeLayers[i].selected = false;               // Deselect layer
        }

        // Apply preset to layer
        if (mode) {
            for (var i=0; i<activeLayers.length; i++) {
                activeLayers[i].selected = true;            // Select individual layer
                activeLayers[i].applyPreset(preset);        // Apply preset to layer
                activeLayers[i].selected = false;           // Deselect individual layer
            }
        }

        // Reselect all layers
        for (var i=0; i<activeLayers.length; i++) {
            activeLayers[i].selected = true;
        }

    }

})(this);