FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode
);

FilePond.setOptions({
    stylePanelAspectRatio: 150 / 100,
    imageResizeTargetWidth:100,
    imageResizeTargetHeight:150
})

FilePond.parse(document.body);

document.addEventListener('FilePond:pluginloaded', e => {
    console.log('FilePond plugin is ready for use', e.detail);
});