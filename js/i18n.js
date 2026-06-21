/* ============================================================
   i18n — Russian/English interface strings
   ============================================================ */
window.IC = window.IC || {};
IC.i18n = (function() {

  var _lang = 'ru';

  var _strings = {
    ru: {
      /* App */
      'app.title': 'ImageCaliper 9 — Измерение изображений',

      /* Tools */
      'tool.distance':   'Расстояние',
      'tool.circle3':    'По 3 точкам',
      'tool.circle1':    'Центр + точка',
      'tool.polyline':   'Ломаная',
      'tool.polygon':    'Площадь',
      'tool.angle':      'Угол',
      'tool.scalebar':   'Шкала',
      'tool.calibrate':  'Калибровка',
      'tool.rotate':     'Поворот',
      'tool.crop':       'Обрезка',
      'tool.annotation': 'Аннотация',

      'tool.distance.hint':   'Линейное расстояние (2 точки)',
      'tool.circle3.hint':    'Окружность по 3 точкам',
      'tool.circle1.hint':    'Окружность: центр + точка',
      'tool.polyline.hint':   'Ломаная линия (Enter=готово, Escape=отмена точки)',
      'tool.polygon.hint':    'Площадь многоугольника',
      'tool.angle.hint':      'Угол: точка-вершина-точка (Shift=15°)',
      'tool.scalebar.hint':   'Масштабная планка — прямоугольник заданной длины',
      'tool.calibrate.hint':  'Калибровка — провести отрезок известной длины',
      'tool.rotate.hint':     'Поворот — стрелки ← →, Shift+стрелки 0.1°',
      'tool.crop.hint':       'Обрезка — выделите область',
      'tool.annotation.hint': 'Аннотация: линия или стрелка',

      /* Annotation subtypes */
      'anno.line':     'Линия',
      'anno.arrow':    'Стрелка',
      'anno.rect':     'Прямоугольник',
      'anno.ellipse':  'Эллипс',
      'anno.text':     'Текст',

      /* Panels */
      'panel.measurements': '📏 Измерения',
      'panel.properties':   '🎨 Свойства',
      'panel.crop':         '✂ Обрезка',
      'panel.rotate':       '↻ Поворот',

      /* Property labels */
      'prop.color':           'Цвет',
      'prop.border':          'Граница',
      'prop.borderOpacity':   'прозр.',
      'prop.thickness':       'Толщина',
      'prop.style':           'Стиль',
      'prop.fill':            'Заливка',
      'prop.fillOpacity':     'Прозр. заливки',
      'prop.format':          'Формат',
      'prop.font':            'Шрифт',
      'prop.size':            'Размер',
      'prop.fontColor':       'Цвет текста',
      'prop.labelBg':         'Фон подписи',
      'prop.labelBgOpacity':  'Прозр. фона',
      'prop.unit':            'Единица',
      'prop.own':             'своя',
      'prop.fontStyle':       'Стиль',
      'prop.ends':            'Концы',
      'prop.pointSize':       'Размер',
      'prop.height':          'Высота',
      'prop.value':           'Значение',
      'prop.label':           'Подпись',
      'prop.show':            'показать',
      'prop.doubleEnded':     'Двусторонняя',
      'prop.rotation':        'Поворот',
      'prop.text':            'Текст',
      'polygon.close':        'Замкнуть',
      /* Crop panel */
      'crop.aspect':   'Соотношение',
      'crop.aspect.free':   'Свободно',
      'crop.aspect.custom': 'Своё',
      'crop.width':   'Ширина',
      'crop.height':  'Высота',
      'crop.apply':   'Применить',
      'crop.cancel':  'Отмена',
      'crop.reset':   'Сброс',

      /* Rotate panel */
      'rotate.angle':  'Угол',
      'rotate.reset':  'Сброс',
      'rotate.done':   'Готово',
      'rotate.cancel': 'Отмена',

      /* Scalebar modal */
      'scalebar.title':  'Масштабная планка',
      'scalebar.length': 'Длина',
      'scalebar.height': 'Высота',
      'scalebar.create': 'Создать',

      /* Calibration */
      'calibrate.title':        '🗜 Калибровка изображения',
      'calibrate.instruction':  'Проведите отрезок известной длины на изображении (кликните 2 точки).',
      'calibrate.segmentLen':   'Длина отрезка',
      'calibrate.dpiAuto':      'DPI в пикселях на дюйм будет пересчитан автоматически.',
      'calibrate.apply':        'Применить калибровку',

      /* Calibration dialog (old) */
      'calib.title':        '🗜 Калибровка',
      'calib.chooseMethod': 'Выберите способ калибровки',
      'calib.enterDpi':     'Ввести DPI вручную',
      'calib.apply':        'Применить',
      'calib.calibrate':    '📏 Откалибровать отрезком известной длины',
      'calib.done':         'Готово',

      /* Calibration wizard */
      'calibWiz.title':     'ImageCaliper 9',
      'calibWiz.subtitle':  'Изображение загружено. Выберите способ калибровки:',
      'calibWiz.dpi':       'Ввести DPI',
      'calibWiz.apply':     'Применить',
      'calibWiz.ratio':     'Известное соотношение',
      'calibWiz.segment':   'Отрезок',
      'calibWiz.calibrate': '📏 Калибровать',
      'calibWiz.preset':    'Шаблон',
      'calibWiz.select':    '— выберите —',
      'calibWiz.save':      '+ Сохранить шаблон',
      'calibWiz.delete':    '✕ Удалить',
      'calibWiz.promptName':'Название шаблона:',
      'calibWiz.measure':   'К измерениям',
      'calibWiz.rotate':    'Поворот',

      /* Export modal */
      'export.title':      '🖼 Экспорт PNG',
      'export.subtitle':   'Выберите разрешение экспорта',
      'export.screen':     'Как на экране',
      'export.screenHint': 'Текущий масштаб и положение экрана. Для презентаций.',
      'export.print':      'Для печати',
      'export.printHint':  '300 DPI, минимум 1800 px. Для статей и отчётов.',
      'export.copy':       '📋 Копировать',
      'export.cancel':     'Отмена',
      'export.export':     'Экспорт',

      /* Line styles */
      'style.solid':  'Сплошная',
      'style.dashed': 'Штриховая',
      'style.dotted': 'Точечная',

      /* Point styles */
      'ends.none':   'Нет',
      'ends.circle': 'Кружки',
      'ends.tick':   'Черточки',

      /* UI buttons */
      'ui.load':     '📁 Загрузить',
      'ui.save':     '💾 Сохранить проект',
      'ui.export':   '🖼 Экспорт PNG',
      'ui.clear':    '🗑 Очистить',
      'ui.undo':     '↩ Отменить',
      'ui.clip':     'Клиппинг',
      'ui.bg':       'Фон',
      'ui.bgBlack':  'Чёрный',
      'ui.bgWhite':  'Белый',
      'ui.lang':     'Язык',

      'ui.noImage':        '📁 Загрузите изображение для начала работы',
      'ui.noMeasurements': 'Пока нет измерений',
      'ui.info':           'ℹ Информация об изображении',
      'ui.points':         'Всего точек',
      'ui.mode':           'Режим',
      'ui.formatHint':     'JPEG, PNG, BMP, WebP, TIFF, PPM/PGM/PBM',
      'ui.auto':           'авто',
      'ui.manual':         'вручную',
      'ui.size':           'Размер',
      'ui.measurements':   'Измерений',

      /* Buttons in properties */
      'btn.saveStyle':  '💾 Запомнить',
      'btn.applyToAll': '📋 Применить ко всем',

      'btn.saveStyle.title':  'Сохранить как стиль по умолчанию для этого типа',
      'btn.applyToAll.title': 'Применить этот стиль ко всем измерениям того же типа',

      /* Status messages */
      'status.loadImage':       'Загрузите изображение',
      'status.saveImage':       'Нет изображения для сохранения',
      'status.saved':           'Проект сохранён',
      'status.invalidFormat':   'Неверный формат проекта',
      'status.loaded':          'Проект загружен',
      'status.loadError':       'Ошибка загрузки изображения из проекта',
      'status.readError':       'Ошибка чтения файла',
      'status.exportSaved':     'Экспорт сохранён',
      'status.selected':        'Выбрано',
      'status.deselected':      'Выбор снят',
      'status.noImage':         'Нет изображения для экспорта',
      'status.loadImageFirst':  'Сначала загрузите изображение',
      'status.closedPolyline':  'Замкнутая ломаная',
      'status.colinear':        'Точки коллинеарны.',
      'status.undo':            'Отменено',
      'status.nothingToUndo':   'Нечего отменять',
      'status.clearDone':       'Очищено',
      'status.finishRotateCrop':'Завершите поворот или обрезку',
      'status.polylineMode':    'Режим: Ломаная',
      'status.annoCancelled':   'Аннотация отменена',
      'status.rotation':        'Поворот',
      'status.rotationDone':    'Поворот завершён. Выбирайте инструмент измерения.',
      'status.rotationReset':   'Поворот сброшен',
      'status.rotationCancelled':'Поворот отменён.',
      'status.cropHint':        'Обрезка: растяните прямоугольник на изображении или задайте размеры',
      'status.cropTooSmall':    'Слишком маленькая область',
      'status.cropApplied':     'Обрезка применена',
      'status.cropCancelled':   'Обрезка отменена',
      'status.cropReset':       'Обрезка сброшена',
      'status.styleSaved':      'Стиль сохранён',
      'status.styleApplied':    'Стиль применён ко всем',
      'status.calibClick':      'Калибровка: кликните первую точку',
      'status.calibDone':       'Калибровка завершена. Выбирайте инструмент измерения.',
      'status.scalebarEnterLen':'Введите длину',
      'status.scalebarClick':   'Кликните на изображение для размещения планки',
      'status.enterDpi':        'Введите DPI > 0',
      'status.invalidDpi':      'Некорректный DPI.',
      'status.presetSaved':     'Шаблон сохранён',
      'status.presetDeleted':   'Шаблон удалён',
      'status.presetApplied':   'Шаблон применён',
      'status.copied':          'Изображение скопировано в буфер обмена',
      'status.copyError':       'Не удалось скопировать',
      'status.rawNotSupported': 'RAW не поддерживается. Конвертируйте в JPEG/PNG/TIFF.',
      'status.loadFailed':      'Не удалось загрузить изображение.',
      'status.tiffNotSupported':'TIFF не поддерживается. Конвертируйте в JPEG/PNG.',
      'status.pnmDecodeFailed':  'Не удалось декодировать PNM.',
      'status.pnmError':        'Ошибка PNM: ',
      'status.pnmNotSupported': 'Формат PNM не поддерживается.',
      'status.tiffLoaded':      'TIFF загружен: ',
      'status.tiffDisplayError':'Ошибка отображения TIFF.',
      'status.blocked':         'Завершите поворот или обрезку перед загрузкой',
      'status.blockedSave':     'Завершите поворот или обрезку перед сохранением',
      'status.blockedExport':   'Завершите поворот или обрезку перед экспортом',

      'rotate.status': 'Поворот',
      'rotate.hint':   '← → 1°, Shift+← → 0.1°. Перетаскивайте направляющие.',
      'rotate.barHint':'↻ Режим поворота: ← → (1°), Shift+← → (0.1°)',
      'rotate.buttons':'Кнопки — 10° и 1°',
      'status.dragHint':  'перетаскивание точек. Shift+перетаскивание — переместить фигуру',

      'calib.barHint': '⚡ Режим калибровки: кликните первую точку отрезка известной длины',
      'calib.hint':    'Кликните первую точку отрезка длиной',
      'calib.secondClick': 'Калибровка: кликните вторую точку',
      'polyline.hint':     'Ломаная: Escape — удалить точку, Enter — завершить',
      'status.subtype':    'Подтип',

      'angle.deg': '°',
    },

    en: {
      /* App */
      'app.title': 'ImageCaliper 9 — Image Measurement',

      /* Tools */
      'tool.distance':   'Distance',
      'tool.circle3':    '3-Point Circle',
      'tool.circle1':    'Center + Point',
      'tool.polyline':   'Polyline',
      'tool.polygon':    'Polygon',
      'tool.angle':      'Angle',
      'tool.scalebar':   'Scale Bar',
      'tool.calibrate':  'Calibrate',
      'tool.rotate':     'Rotate',
      'tool.crop':       'Crop',
      'tool.annotation': 'Annotation',

      'tool.distance.hint':   'Linear distance (2 points)',
      'tool.circle3.hint':    '3-point circle',
      'tool.circle1.hint':    'Circle: center + point',
      'tool.polyline.hint':   'Polyline (Enter=finish, Escape=undo point)',
      'tool.polygon.hint':    'Polygon area',
      'tool.angle.hint':      'Angle: point-vertex-point (Shift=15°)',
      'tool.scalebar.hint':   'Scale bar — rectangle of known length',
      'tool.calibrate.hint':  'Calibration — draw a segment of known length',
      'tool.rotate.hint':     'Rotation — ← → keys, Shift+← → 0.1°',
      'tool.crop.hint':       'Crop — select an area',
      'tool.annotation.hint': 'Annotation: line or arrow',

      /* Annotation subtypes */
      'anno.line':     'Line',
      'anno.arrow':    'Arrow',
      'anno.rect':     'Rectangle',
      'anno.ellipse':  'Ellipse',
      'anno.text':     'Text',

      /* Panels */
      'panel.measurements': '📏 Measurements',
      'panel.properties':   '🎨 Properties',
      'panel.crop':         '✂ Crop',
      'panel.rotate':       '↻ Rotate',

      /* Property labels */
      'prop.color':           'Color',
      'prop.border':          'Border',
      'prop.borderOpacity':   'opacity',
      'prop.thickness':       'Thickness',
      'prop.style':           'Style',
      'prop.fill':            'Fill',
      'prop.fillOpacity':     'Fill Opacity',
      'prop.format':          'Format',
      'prop.font':            'Font',
      'prop.size':            'Size',
      'prop.fontColor':       'Text Color',
      'prop.labelBg':         'Label BG',
      'prop.labelBgOpacity':  'BG Opacity',
      'prop.unit':            'Unit',
      'prop.own':             'custom',
      'prop.fontStyle':       'Style',
      'prop.ends':            'Ends',
      'prop.pointSize':       'Point Size',
      'prop.height':          'Height',
      'prop.value':           'Value',
      'prop.label':           'Label',
      'prop.show':            'show',
      'prop.doubleEnded':     'Double-ended',
      'prop.rotation':        'Rotation',
      'prop.text':            'Text',
      'polygon.close':        'close',

      /* Crop panel */
      'crop.aspect':   'Aspect Ratio',
      'crop.aspect.free':   'Freeform',
      'crop.aspect.custom': 'Custom',
      'crop.width':   'Width',
      'crop.height':  'Height',
      'crop.apply':   'Apply',
      'crop.cancel':  'Cancel',
      'crop.reset':   'Reset',

      /* Rotate panel */
      'rotate.angle':  'Angle',
      'rotate.reset':  'Reset',
      'rotate.done':   'Done',
      'rotate.cancel': 'Cancel',

      /* Scalebar modal */
      'scalebar.title':  'Scale Bar',
      'scalebar.length': 'Length',
      'scalebar.height': 'Height',
      'scalebar.create': 'Create',

      /* Calibration */
      'calibrate.title':        '🗜 Calibration',
      'calibrate.instruction':  'Draw a segment of known length on the image (click 2 points).',
      'calibrate.segmentLen':   'Segment length',
      'calibrate.dpiAuto':      'DPI will be recalculated automatically.',
      'calibrate.apply':        'Apply calibration',

      /* Calibration dialog (old) */
      'calib.title':        '🗜 Calibration',
      'calib.chooseMethod': 'Choose calibration method',
      'calib.enterDpi':     'Enter DPI manually',
      'calib.apply':        'Apply',
      'calib.calibrate':    '📏 Calibrate with a segment of known length',
      'calib.done':         'Done',

      /* Calibration wizard */
      'calibWiz.title':     'ImageCaliper 9',
      'calibWiz.subtitle':  'Image loaded. Choose calibration method:',
      'calibWiz.dpi':       'Enter DPI',
      'calibWiz.apply':     'Apply',
      'calibWiz.ratio':     'Known ratio',
      'calibWiz.segment':   'Segment',
      'calibWiz.calibrate': '📏 Calibrate',
      'calibWiz.preset':    'Preset',
      'calibWiz.select':    '— select —',
      'calibWiz.save':      '+ Save preset',
      'calibWiz.delete':    '✕ Delete',
      'calibWiz.promptName':'Preset name:',
      'calibWiz.measure':   'To measurements',
      'calibWiz.rotate':    'Rotate',

      /* Export modal */
      'export.title':      '🖼 Export PNG',
      'export.subtitle':   'Select export resolution',
      'export.screen':     'Screen resolution',
      'export.screenHint': 'Current scale and position on screen. For presentations.',
      'export.print':      'Print quality',
      'export.printHint':  '300 DPI, min 1800 px. For articles and reports.',
      'export.copy':       '📋 Copy',
      'export.cancel':     'Cancel',
      'export.export':     'Export',

      /* Line styles */
      'style.solid':  'Solid',
      'style.dashed': 'Dashed',
      'style.dotted': 'Dotted',

      /* Point styles */
      'ends.none':   'None',
      'ends.circle': 'Circles',
      'ends.tick':   'Ticks',

      /* UI buttons */
      'ui.load':     '📁 Load',
      'ui.save':     '💾 Save Project',
      'ui.export':   '🖼 Export PNG',
      'ui.clear':    '🗑 Clear',
      'ui.undo':     '↩ Undo',
      'ui.clip':     'Clip',
      'ui.bg':       'BG',
      'ui.bgBlack':  'Black',
      'ui.bgWhite':  'White',
      'ui.lang':     'Language',

      'ui.noImage':        '📁 Load an image to start',
      'ui.noMeasurements': 'No measurements yet',
      'ui.info':           'ℹ Image Info',
      'ui.points':         'Points',
      'ui.mode':           'Mode',
      'ui.formatHint':     'JPEG, PNG, BMP, WebP, TIFF, PPM/PGM/PBM',
      'ui.auto':           'auto',
      'ui.manual':         'manual',
      'ui.size':           'Size',
      'ui.measurements':   'Measurements',

      /* Buttons in properties */
      'btn.saveStyle':  '💾 Remember',
      'btn.applyToAll': '📋 Apply to all',

      'btn.saveStyle.title':  'Save as default style for this type',
      'btn.applyToAll.title': 'Apply this style to all measurements of the same type',

      /* Status messages */
      'status.loadImage':       'Load an image',
      'status.saveImage':       'No image to save',
      'status.saved':           'Project saved',
      'status.invalidFormat':   'Invalid project format',
      'status.loaded':          'Project loaded',
      'status.loadError':       'Error loading image from project',
      'status.readError':       'Error reading file',
      'status.exportSaved':     'Export saved',
      'status.selected':        'Selected',
      'status.deselected':      'Deselected',
      'status.noImage':         'No image to export',
      'status.loadImageFirst':  'Load an image first',
      'status.closedPolyline':  'Closed polyline',
      'status.colinear':        'Points are collinear.',
      'status.undo':            'Undone',
      'status.nothingToUndo':   'Nothing to undo',
      'status.clearDone':       'Cleared',
      'status.finishRotateCrop':'Finish rotation or crop first',
      'status.polylineMode':    'Mode: Polyline',
      'status.annoCancelled':   'Annotation cancelled',
      'status.rotation':        'Rotation',
      'status.rotationDone':    'Rotation complete. Choose a measurement tool.',
      'status.rotationReset':   'Rotation reset',
      'status.rotationCancelled':'Rotation cancelled.',
      'status.cropHint':        'Crop: drag a rectangle on the image or enter dimensions',
      'status.cropTooSmall':    'Area too small',
      'status.cropApplied':     'Crop applied',
      'status.cropCancelled':   'Crop cancelled',
      'status.cropReset':       'Crop reset',
      'status.styleSaved':      'Style saved',
      'status.styleApplied':    'Style applied to all',
      'status.calibClick':      'Calibration: click first point',
      'status.calibDone':       'Calibration complete. Choose a measurement tool.',
      'status.scalebarEnterLen':'Enter length',
      'status.scalebarClick':   'Click on the image to place the bar',
      'status.enterDpi':        'Enter DPI > 0',
      'status.invalidDpi':      'Invalid DPI.',
      'status.presetSaved':     'Preset saved',
      'status.presetDeleted':   'Preset deleted',
      'status.presetApplied':   'Preset applied',
      'status.copied':          'Image copied to clipboard',
      'status.copyError':       'Failed to copy',
      'status.rawNotSupported': 'RAW not supported. Convert to JPEG/PNG/TIFF.',
      'status.loadFailed':      'Failed to load image.',
      'status.tiffNotSupported':'TIFF not supported. Convert to JPEG/PNG.',
      'status.pnmDecodeFailed':  'Failed to decode PNM.',
      'status.pnmError':        'PNM error: ',
      'status.pnmNotSupported': 'PNM format not supported.',
      'status.tiffLoaded':      'TIFF loaded: ',
      'status.tiffDisplayError':'TIFF display error.',
      'status.blocked':         'Finish rotation or crop before loading',
      'status.blockedSave':     'Finish rotation or crop before saving',
      'status.blockedExport':   'Finish rotation or crop before exporting',

      'rotate.status': 'Rotation',
      'rotate.hint':   '← → 1°, Shift+← → 0.1°. Drag the guides.',
      'rotate.barHint':'↻ Rotate mode: ← → (1°), Shift+← → (0.1°)',
      'rotate.buttons':'Buttons — 10° and 1°',
      'status.dragHint':  'drag points. Shift+drag to move shape',

      'calib.barHint': '⚡ Calibration mode: click the first point of a segment of known length',
      'calib.hint':    'Click first point of a segment of length',
      'calib.secondClick': 'Calibration: click the second point',
      'polyline.hint':     'Polyline: click points. Escape — undo point, Enter — finish',
      'status.subtype':    'Subtype',

      'angle.deg': '°',
    }
  };

  function t(key) {
    return (_strings[_lang] && _strings[_lang][key]) || key;
  }

  function setLang(l) {
    if (_strings[l]) { _lang = l; return true; }
    return false;
  }

  function getLang() {
    return _lang;
  }

  /**
   * Apply current language to all DOM elements with data-i18n attributes.
   */
  function applyDOM() {
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function(el) {
      el.title = t(el.dataset.i18nTitle);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
  }

  return { t: t, setLang: setLang, getLang: getLang, applyDOM: applyDOM };
})();
