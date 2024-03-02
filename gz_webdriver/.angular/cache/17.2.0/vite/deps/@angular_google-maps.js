import {
  isPlatformBrowser
} from "./chunk-WXHRFX5Z.js";
import {
  BehaviorSubject,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  Injectable,
  Input,
  NgModule,
  NgZone,
  Observable,
  Output,
  PLATFORM_ID,
  Subject,
  ViewEncapsulation$1,
  combineLatest,
  inject,
  map,
  setClassMetadata,
  switchMap,
  take,
  takeUntil,
  ɵɵNgOnChangesFeature,
  ɵɵStandaloneFeature,
  ɵɵcontentQuery,
  ɵɵdefineComponent,
  ɵɵdefineDirective,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵinject,
  ɵɵloadQuery,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵqueryRefresh
} from "./chunk-X6QWQI3J.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-GLLL6ZVE.js";

// node_modules/@angular/google-maps/fesm2022/google-maps.mjs
var _c0 = ["*"];
var MapEventManager = class {
  /** Clears all currently-registered event listeners. */
  _clearListeners() {
    for (const listener of this._listeners) {
      listener.remove();
    }
    this._listeners = [];
  }
  constructor(_ngZone) {
    this._ngZone = _ngZone;
    this._pending = [];
    this._listeners = [];
    this._targetStream = new BehaviorSubject(void 0);
  }
  /** Gets an observable that adds an event listener to the map when a consumer subscribes to it. */
  getLazyEmitter(name) {
    return this._targetStream.pipe(switchMap((target) => {
      const observable = new Observable((observer) => {
        if (!target) {
          this._pending.push({
            observable,
            observer
          });
          return void 0;
        }
        const listener = target.addListener(name, (event) => {
          this._ngZone.run(() => observer.next(event));
        });
        if (!listener) {
          observer.complete();
          return void 0;
        }
        this._listeners.push(listener);
        return () => listener.remove();
      });
      return observable;
    }));
  }
  /** Sets the current target that the manager should bind events to. */
  setTarget(target) {
    const currentTarget = this._targetStream.value;
    if (target === currentTarget) {
      return;
    }
    if (currentTarget) {
      this._clearListeners();
      this._pending = [];
    }
    this._targetStream.next(target);
    this._pending.forEach((subscriber) => subscriber.observable.subscribe(subscriber.observer));
    this._pending = [];
  }
  /** Destroys the manager and clears the event listeners. */
  destroy() {
    this._clearListeners();
    this._pending = [];
    this._targetStream.complete();
  }
};
var DEFAULT_OPTIONS = {
  center: {
    lat: 37.421995,
    lng: -122.084092
  },
  zoom: 17,
  // Note: the type conversion here isn't necessary for our CI, but it resolves a g3 failure.
  mapTypeId: "roadmap"
};
var DEFAULT_HEIGHT = "500px";
var DEFAULT_WIDTH = "500px";
var _GoogleMap = class _GoogleMap {
  set center(center) {
    this._center = center;
  }
  set zoom(zoom) {
    this._zoom = zoom;
  }
  set options(options) {
    this._options = options || DEFAULT_OPTIONS;
  }
  constructor(_elementRef, _ngZone, platformId) {
    this._elementRef = _elementRef;
    this._ngZone = _ngZone;
    this._eventManager = new MapEventManager(inject(NgZone));
    this.height = DEFAULT_HEIGHT;
    this.width = DEFAULT_WIDTH;
    this._options = DEFAULT_OPTIONS;
    this.mapInitialized = new EventEmitter();
    this.authFailure = new EventEmitter();
    this.boundsChanged = this._eventManager.getLazyEmitter("bounds_changed");
    this.centerChanged = this._eventManager.getLazyEmitter("center_changed");
    this.mapClick = this._eventManager.getLazyEmitter("click");
    this.mapDblclick = this._eventManager.getLazyEmitter("dblclick");
    this.mapDrag = this._eventManager.getLazyEmitter("drag");
    this.mapDragend = this._eventManager.getLazyEmitter("dragend");
    this.mapDragstart = this._eventManager.getLazyEmitter("dragstart");
    this.headingChanged = this._eventManager.getLazyEmitter("heading_changed");
    this.idle = this._eventManager.getLazyEmitter("idle");
    this.maptypeidChanged = this._eventManager.getLazyEmitter("maptypeid_changed");
    this.mapMousemove = this._eventManager.getLazyEmitter("mousemove");
    this.mapMouseout = this._eventManager.getLazyEmitter("mouseout");
    this.mapMouseover = this._eventManager.getLazyEmitter("mouseover");
    this.projectionChanged = this._eventManager.getLazyEmitter("projection_changed");
    this.mapRightclick = this._eventManager.getLazyEmitter("rightclick");
    this.tilesloaded = this._eventManager.getLazyEmitter("tilesloaded");
    this.tiltChanged = this._eventManager.getLazyEmitter("tilt_changed");
    this.zoomChanged = this._eventManager.getLazyEmitter("zoom_changed");
    this._isBrowser = isPlatformBrowser(platformId);
    if (this._isBrowser) {
      const googleMapsWindow = window;
      if (!googleMapsWindow.google && (typeof ngDevMode === "undefined" || ngDevMode)) {
        throw Error("Namespace google not found, cannot construct embedded google map. Please install the Google Maps JavaScript API: https://developers.google.com/maps/documentation/javascript/tutorial#Loading_the_Maps_API");
      }
      this._existingAuthFailureCallback = googleMapsWindow.gm_authFailure;
      googleMapsWindow.gm_authFailure = () => {
        if (this._existingAuthFailureCallback) {
          this._existingAuthFailureCallback();
        }
        this.authFailure.emit();
      };
    }
  }
  ngOnChanges(changes) {
    if (changes["height"] || changes["width"]) {
      this._setSize();
    }
    const googleMap = this.googleMap;
    if (googleMap) {
      if (changes["options"]) {
        googleMap.setOptions(this._combineOptions());
      }
      if (changes["center"] && this._center) {
        googleMap.setCenter(this._center);
      }
      if (changes["zoom"] && this._zoom != null) {
        googleMap.setZoom(this._zoom);
      }
      if (changes["mapTypeId"] && this.mapTypeId) {
        googleMap.setMapTypeId(this.mapTypeId);
      }
    }
  }
  ngOnInit() {
    if (this._isBrowser) {
      this._mapEl = this._elementRef.nativeElement.querySelector(".map-container");
      this._setSize();
      if (google.maps.Map) {
        this._initialize(google.maps.Map);
      } else {
        this._ngZone.runOutsideAngular(() => {
          google.maps.importLibrary("maps").then((lib) => this._initialize(lib.Map));
        });
      }
    }
  }
  _initialize(mapConstructor) {
    this._ngZone.runOutsideAngular(() => {
      this.googleMap = new mapConstructor(this._mapEl, this._combineOptions());
      this._eventManager.setTarget(this.googleMap);
      this.mapInitialized.emit(this.googleMap);
    });
  }
  ngOnDestroy() {
    this.mapInitialized.complete();
    this._eventManager.destroy();
    if (this._isBrowser) {
      const googleMapsWindow = window;
      googleMapsWindow.gm_authFailure = this._existingAuthFailureCallback;
    }
  }
  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.fitBounds
   */
  fitBounds(bounds, padding) {
    this._assertInitialized();
    this.googleMap.fitBounds(bounds, padding);
  }
  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.panBy
   */
  panBy(x, y) {
    this._assertInitialized();
    this.googleMap.panBy(x, y);
  }
  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.panTo
   */
  panTo(latLng) {
    this._assertInitialized();
    this.googleMap.panTo(latLng);
  }
  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.panToBounds
   */
  panToBounds(latLngBounds, padding) {
    this._assertInitialized();
    this.googleMap.panToBounds(latLngBounds, padding);
  }
  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.getBounds
   */
  getBounds() {
    this._assertInitialized();
    return this.googleMap.getBounds() || null;
  }
  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.getCenter
   */
  getCenter() {
    this._assertInitialized();
    return this.googleMap.getCenter();
  }
  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.getClickableIcons
   */
  getClickableIcons() {
    this._assertInitialized();
    return this.googleMap.getClickableIcons();
  }
  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.getHeading
   */
  getHeading() {
    this._assertInitialized();
    return this.googleMap.getHeading();
  }
  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.getMapTypeId
   */
  getMapTypeId() {
    this._assertInitialized();
    return this.googleMap.getMapTypeId();
  }
  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.getProjection
   */
  getProjection() {
    this._assertInitialized();
    return this.googleMap.getProjection() || null;
  }
  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.getStreetView
   */
  getStreetView() {
    this._assertInitialized();
    return this.googleMap.getStreetView();
  }
  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.getTilt
   */
  getTilt() {
    this._assertInitialized();
    return this.googleMap.getTilt();
  }
  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.getZoom
   */
  getZoom() {
    this._assertInitialized();
    return this.googleMap.getZoom();
  }
  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.controls
   */
  get controls() {
    this._assertInitialized();
    return this.googleMap.controls;
  }
  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.data
   */
  get data() {
    this._assertInitialized();
    return this.googleMap.data;
  }
  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.mapTypes
   */
  get mapTypes() {
    this._assertInitialized();
    return this.googleMap.mapTypes;
  }
  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.overlayMapTypes
   */
  get overlayMapTypes() {
    this._assertInitialized();
    return this.googleMap.overlayMapTypes;
  }
  /** Returns a promise that resolves when the map has been initialized. */
  _resolveMap() {
    return this.googleMap ? Promise.resolve(this.googleMap) : this.mapInitialized.pipe(take(1)).toPromise();
  }
  _setSize() {
    if (this._mapEl) {
      const styles = this._mapEl.style;
      styles.height = this.height === null ? "" : coerceCssPixelValue(this.height) || DEFAULT_HEIGHT;
      styles.width = this.width === null ? "" : coerceCssPixelValue(this.width) || DEFAULT_WIDTH;
    }
  }
  /** Combines the center and zoom and the other map options into a single object */
  _combineOptions() {
    const options = this._options || {};
    return __spreadProps(__spreadValues({}, options), {
      // It's important that we set **some** kind of `center` and `zoom`, otherwise
      // Google Maps will render a blank rectangle which looks broken.
      center: this._center || options.center || DEFAULT_OPTIONS.center,
      zoom: this._zoom ?? options.zoom ?? DEFAULT_OPTIONS.zoom,
      // Passing in an undefined `mapTypeId` seems to break tile loading
      // so make sure that we have some kind of default (see #22082).
      mapTypeId: this.mapTypeId || options.mapTypeId || DEFAULT_OPTIONS.mapTypeId
    });
  }
  /** Asserts that the map has been initialized. */
  _assertInitialized() {
    if (!this.googleMap && (typeof ngDevMode === "undefined" || ngDevMode)) {
      throw Error("Cannot access Google Map information before the API has been initialized. Please wait for the API to load before trying to interact with it.");
    }
  }
};
_GoogleMap.ɵfac = function GoogleMap_Factory(t) {
  return new (t || _GoogleMap)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(NgZone), ɵɵdirectiveInject(PLATFORM_ID));
};
_GoogleMap.ɵcmp = ɵɵdefineComponent({
  type: _GoogleMap,
  selectors: [["google-map"]],
  inputs: {
    height: "height",
    width: "width",
    mapTypeId: "mapTypeId",
    center: "center",
    zoom: "zoom",
    options: "options"
  },
  outputs: {
    mapInitialized: "mapInitialized",
    authFailure: "authFailure",
    boundsChanged: "boundsChanged",
    centerChanged: "centerChanged",
    mapClick: "mapClick",
    mapDblclick: "mapDblclick",
    mapDrag: "mapDrag",
    mapDragend: "mapDragend",
    mapDragstart: "mapDragstart",
    headingChanged: "headingChanged",
    idle: "idle",
    maptypeidChanged: "maptypeidChanged",
    mapMousemove: "mapMousemove",
    mapMouseout: "mapMouseout",
    mapMouseover: "mapMouseover",
    projectionChanged: "projectionChanged",
    mapRightclick: "mapRightclick",
    tilesloaded: "tilesloaded",
    tiltChanged: "tiltChanged",
    zoomChanged: "zoomChanged"
  },
  exportAs: ["googleMap"],
  standalone: true,
  features: [ɵɵNgOnChangesFeature, ɵɵStandaloneFeature],
  ngContentSelectors: _c0,
  decls: 2,
  vars: 0,
  consts: [[1, "map-container"]],
  template: function GoogleMap_Template(rf, ctx) {
    if (rf & 1) {
      ɵɵprojectionDef();
      ɵɵelement(0, "div", 0);
      ɵɵprojection(1);
    }
  },
  encapsulation: 2,
  changeDetection: 0
});
var GoogleMap = _GoogleMap;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(GoogleMap, [{
    type: Component,
    args: [{
      selector: "google-map",
      exportAs: "googleMap",
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: '<div class="map-container"></div><ng-content />',
      encapsulation: ViewEncapsulation$1.None
    }]
  }], () => [{
    type: ElementRef
  }, {
    type: NgZone
  }, {
    type: Object,
    decorators: [{
      type: Inject,
      args: [PLATFORM_ID]
    }]
  }], {
    height: [{
      type: Input
    }],
    width: [{
      type: Input
    }],
    mapTypeId: [{
      type: Input
    }],
    center: [{
      type: Input
    }],
    zoom: [{
      type: Input
    }],
    options: [{
      type: Input
    }],
    mapInitialized: [{
      type: Output
    }],
    authFailure: [{
      type: Output
    }],
    boundsChanged: [{
      type: Output
    }],
    centerChanged: [{
      type: Output
    }],
    mapClick: [{
      type: Output
    }],
    mapDblclick: [{
      type: Output
    }],
    mapDrag: [{
      type: Output
    }],
    mapDragend: [{
      type: Output
    }],
    mapDragstart: [{
      type: Output
    }],
    headingChanged: [{
      type: Output
    }],
    idle: [{
      type: Output
    }],
    maptypeidChanged: [{
      type: Output
    }],
    mapMousemove: [{
      type: Output
    }],
    mapMouseout: [{
      type: Output
    }],
    mapMouseover: [{
      type: Output
    }],
    projectionChanged: [{
      type: Output
    }],
    mapRightclick: [{
      type: Output
    }],
    tilesloaded: [{
      type: Output
    }],
    tiltChanged: [{
      type: Output
    }],
    zoomChanged: [{
      type: Output
    }]
  });
})();
var cssUnitsPattern = /([A-Za-z%]+)$/;
function coerceCssPixelValue(value) {
  if (value == null) {
    return "";
  }
  return cssUnitsPattern.test(value) ? value : `${value}px`;
}
var _MapBaseLayer = class _MapBaseLayer {
  constructor(_map, _ngZone) {
    this._map = _map;
    this._ngZone = _ngZone;
  }
  ngOnInit() {
    if (this._map._isBrowser) {
      this._ngZone.runOutsideAngular(() => {
        this._initializeObject();
      });
      this._assertInitialized();
      this._setMap();
    }
  }
  ngOnDestroy() {
    this._unsetMap();
  }
  _assertInitialized() {
    if (!this._map.googleMap) {
      throw Error("Cannot access Google Map information before the API has been initialized. Please wait for the API to load before trying to interact with it.");
    }
  }
  _initializeObject() {
  }
  _setMap() {
  }
  _unsetMap() {
  }
};
_MapBaseLayer.ɵfac = function MapBaseLayer_Factory(t) {
  return new (t || _MapBaseLayer)(ɵɵdirectiveInject(GoogleMap), ɵɵdirectiveInject(NgZone));
};
_MapBaseLayer.ɵdir = ɵɵdefineDirective({
  type: _MapBaseLayer,
  selectors: [["map-base-layer"]],
  exportAs: ["mapBaseLayer"],
  standalone: true
});
var MapBaseLayer = _MapBaseLayer;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MapBaseLayer, [{
    type: Directive,
    args: [{
      selector: "map-base-layer",
      exportAs: "mapBaseLayer",
      standalone: true
    }]
  }], () => [{
    type: GoogleMap
  }, {
    type: NgZone
  }], null);
})();
var _MapBicyclingLayer = class _MapBicyclingLayer {
  constructor() {
    this._map = inject(GoogleMap);
    this._zone = inject(NgZone);
    this.bicyclingLayerInitialized = new EventEmitter();
  }
  ngOnInit() {
    if (this._map._isBrowser) {
      if (google.maps.BicyclingLayer && this._map.googleMap) {
        this._initialize(this._map.googleMap, google.maps.BicyclingLayer);
      } else {
        this._zone.runOutsideAngular(() => {
          Promise.all([this._map._resolveMap(), google.maps.importLibrary("maps")]).then(([map2, lib]) => {
            this._initialize(map2, lib.BicyclingLayer);
          });
        });
      }
    }
  }
  _initialize(map2, layerConstructor) {
    this._zone.runOutsideAngular(() => {
      this.bicyclingLayer = new layerConstructor();
      this.bicyclingLayerInitialized.emit(this.bicyclingLayer);
      this._assertLayerInitialized();
      this.bicyclingLayer.setMap(map2);
    });
  }
  ngOnDestroy() {
    this.bicyclingLayer?.setMap(null);
  }
  _assertLayerInitialized() {
    if (!this.bicyclingLayer) {
      throw Error("Cannot interact with a Google Map Bicycling Layer before it has been initialized. Please wait for the Transit Layer to load before trying to interact with it.");
    }
  }
};
_MapBicyclingLayer.ɵfac = function MapBicyclingLayer_Factory(t) {
  return new (t || _MapBicyclingLayer)();
};
_MapBicyclingLayer.ɵdir = ɵɵdefineDirective({
  type: _MapBicyclingLayer,
  selectors: [["map-bicycling-layer"]],
  outputs: {
    bicyclingLayerInitialized: "bicyclingLayerInitialized"
  },
  exportAs: ["mapBicyclingLayer"],
  standalone: true
});
var MapBicyclingLayer = _MapBicyclingLayer;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MapBicyclingLayer, [{
    type: Directive,
    args: [{
      selector: "map-bicycling-layer",
      exportAs: "mapBicyclingLayer",
      standalone: true
    }]
  }], null, {
    bicyclingLayerInitialized: [{
      type: Output
    }]
  });
})();
var _MapCircle = class _MapCircle {
  set options(options) {
    this._options.next(options || {});
  }
  set center(center) {
    this._center.next(center);
  }
  set radius(radius) {
    this._radius.next(radius);
  }
  constructor(_map, _ngZone) {
    this._map = _map;
    this._ngZone = _ngZone;
    this._eventManager = new MapEventManager(inject(NgZone));
    this._options = new BehaviorSubject({});
    this._center = new BehaviorSubject(void 0);
    this._radius = new BehaviorSubject(void 0);
    this._destroyed = new Subject();
    this.centerChanged = this._eventManager.getLazyEmitter("center_changed");
    this.circleClick = this._eventManager.getLazyEmitter("click");
    this.circleDblclick = this._eventManager.getLazyEmitter("dblclick");
    this.circleDrag = this._eventManager.getLazyEmitter("drag");
    this.circleDragend = this._eventManager.getLazyEmitter("dragend");
    this.circleDragstart = this._eventManager.getLazyEmitter("dragstart");
    this.circleMousedown = this._eventManager.getLazyEmitter("mousedown");
    this.circleMousemove = this._eventManager.getLazyEmitter("mousemove");
    this.circleMouseout = this._eventManager.getLazyEmitter("mouseout");
    this.circleMouseover = this._eventManager.getLazyEmitter("mouseover");
    this.circleMouseup = this._eventManager.getLazyEmitter("mouseup");
    this.radiusChanged = this._eventManager.getLazyEmitter("radius_changed");
    this.circleRightclick = this._eventManager.getLazyEmitter("rightclick");
    this.circleInitialized = new EventEmitter();
  }
  ngOnInit() {
    if (!this._map._isBrowser) {
      return;
    }
    this._combineOptions().pipe(take(1)).subscribe((options) => {
      if (google.maps.Circle && this._map.googleMap) {
        this._initialize(this._map.googleMap, google.maps.Circle, options);
      } else {
        this._ngZone.runOutsideAngular(() => {
          Promise.all([this._map._resolveMap(), google.maps.importLibrary("maps")]).then(([map2, lib]) => {
            this._initialize(map2, lib.Circle, options);
          });
        });
      }
    });
  }
  _initialize(map2, circleConstructor, options) {
    this._ngZone.runOutsideAngular(() => {
      this.circle = new circleConstructor(options);
      this._assertInitialized();
      this.circle.setMap(map2);
      this._eventManager.setTarget(this.circle);
      this.circleInitialized.emit(this.circle);
      this._watchForOptionsChanges();
      this._watchForCenterChanges();
      this._watchForRadiusChanges();
    });
  }
  ngOnDestroy() {
    this._eventManager.destroy();
    this._destroyed.next();
    this._destroyed.complete();
    this.circle?.setMap(null);
  }
  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Circle.getBounds
   */
  getBounds() {
    this._assertInitialized();
    return this.circle.getBounds();
  }
  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Circle.getCenter
   */
  getCenter() {
    this._assertInitialized();
    return this.circle.getCenter();
  }
  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Circle.getDraggable
   */
  getDraggable() {
    this._assertInitialized();
    return this.circle.getDraggable();
  }
  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Circle.getEditable
   */
  getEditable() {
    this._assertInitialized();
    return this.circle.getEditable();
  }
  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Circle.getRadius
   */
  getRadius() {
    this._assertInitialized();
    return this.circle.getRadius();
  }
  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Circle.getVisible
   */
  getVisible() {
    this._assertInitialized();
    return this.circle.getVisible();
  }
  _combineOptions() {
    return combineLatest([this._options, this._center, this._radius]).pipe(map(([options, center, radius]) => {
      const combinedOptions = __spreadProps(__spreadValues({}, options), {
        center: center || options.center,
        radius: radius !== void 0 ? radius : options.radius
      });
      return combinedOptions;
    }));
  }
  _watchForOptionsChanges() {
    this._options.pipe(takeUntil(this._destroyed)).subscribe((options) => {
      this._assertInitialized();
      this.circle.setOptions(options);
    });
  }
  _watchForCenterChanges() {
    this._center.pipe(takeUntil(this._destroyed)).subscribe((center) => {
      if (center) {
        this._assertInitialized();
        this.circle.setCenter(center);
      }
    });
  }
  _watchForRadiusChanges() {
    this._radius.pipe(takeUntil(this._destroyed)).subscribe((radius) => {
      if (radius !== void 0) {
        this._assertInitialized();
        this.circle.setRadius(radius);
      }
    });
  }
  _assertInitialized() {
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      if (!this.circle) {
        throw Error("Cannot interact with a Google Map Circle before it has been initialized. Please wait for the Circle to load before trying to interact with it.");
      }
    }
  }
};
_MapCircle.ɵfac = function MapCircle_Factory(t) {
  return new (t || _MapCircle)(ɵɵdirectiveInject(GoogleMap), ɵɵdirectiveInject(NgZone));
};
_MapCircle.ɵdir = ɵɵdefineDirective({
  type: _MapCircle,
  selectors: [["map-circle"]],
  inputs: {
    options: "options",
    center: "center",
    radius: "radius"
  },
  outputs: {
    centerChanged: "centerChanged",
    circleClick: "circleClick",
    circleDblclick: "circleDblclick",
    circleDrag: "circleDrag",
    circleDragend: "circleDragend",
    circleDragstart: "circleDragstart",
    circleMousedown: "circleMousedown",
    circleMousemove: "circleMousemove",
    circleMouseout: "circleMouseout",
    circleMouseover: "circleMouseover",
    circleMouseup: "circleMouseup",
    radiusChanged: "radiusChanged",
    circleRightclick: "circleRightclick",
    circleInitialized: "circleInitialized"
  },
  exportAs: ["mapCircle"],
  standalone: true
});
var MapCircle = _MapCircle;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MapCircle, [{
    type: Directive,
    args: [{
      selector: "map-circle",
      exportAs: "mapCircle",
      standalone: true
    }]
  }], () => [{
    type: GoogleMap
  }, {
    type: NgZone
  }], {
    options: [{
      type: Input
    }],
    center: [{
      type: Input
    }],
    radius: [{
      type: Input
    }],
    centerChanged: [{
      type: Output
    }],
    circleClick: [{
      type: Output
    }],
    circleDblclick: [{
      type: Output
    }],
    circleDrag: [{
      type: Output
    }],
    circleDragend: [{
      type: Output
    }],
    circleDragstart: [{
      type: Output
    }],
    circleMousedown: [{
      type: Output
    }],
    circleMousemove: [{
      type: Output
    }],
    circleMouseout: [{
      type: Output
    }],
    circleMouseover: [{
      type: Output
    }],
    circleMouseup: [{
      type: Output
    }],
    radiusChanged: [{
      type: Output
    }],
    circleRightclick: [{
      type: Output
    }],
    circleInitialized: [{
      type: Output
    }]
  });
})();
var _MapDirectionsRenderer = class _MapDirectionsRenderer {
  /**
   * See developers.google.com/maps/documentation/javascript/reference/directions
   * #DirectionsRendererOptions.directions
   */
  set directions(directions) {
    this._directions = directions;
  }
  /**
   * See developers.google.com/maps/documentation/javascript/reference/directions
   * #DirectionsRendererOptions
   */
  set options(options) {
    this._options = options;
  }
  constructor(_googleMap, _ngZone) {
    this._googleMap = _googleMap;
    this._ngZone = _ngZone;
    this._eventManager = new MapEventManager(inject(NgZone));
    this.directionsChanged = this._eventManager.getLazyEmitter("directions_changed");
    this.directionsRendererInitialized = new EventEmitter();
  }
  ngOnInit() {
    if (this._googleMap._isBrowser) {
      if (google.maps.DirectionsRenderer && this._googleMap.googleMap) {
        this._initialize(this._googleMap.googleMap, google.maps.DirectionsRenderer);
      } else {
        this._ngZone.runOutsideAngular(() => {
          Promise.all([this._googleMap._resolveMap(), google.maps.importLibrary("routes")]).then(([map2, lib]) => {
            this._initialize(map2, lib.DirectionsRenderer);
          });
        });
      }
    }
  }
  _initialize(map2, rendererConstructor) {
    this._ngZone.runOutsideAngular(() => {
      this.directionsRenderer = new rendererConstructor(this._combineOptions());
      this._assertInitialized();
      this.directionsRenderer.setMap(map2);
      this._eventManager.setTarget(this.directionsRenderer);
      this.directionsRendererInitialized.emit(this.directionsRenderer);
    });
  }
  ngOnChanges(changes) {
    if (this.directionsRenderer) {
      if (changes["options"]) {
        this.directionsRenderer.setOptions(this._combineOptions());
      }
      if (changes["directions"] && this._directions !== void 0) {
        this.directionsRenderer.setDirections(this._directions);
      }
    }
  }
  ngOnDestroy() {
    this._eventManager.destroy();
    this.directionsRenderer?.setMap(null);
  }
  /**
   * See developers.google.com/maps/documentation/javascript/reference/directions
   * #DirectionsRenderer.getDirections
   */
  getDirections() {
    this._assertInitialized();
    return this.directionsRenderer.getDirections();
  }
  /**
   * See developers.google.com/maps/documentation/javascript/reference/directions
   * #DirectionsRenderer.getPanel
   */
  getPanel() {
    this._assertInitialized();
    return this.directionsRenderer.getPanel();
  }
  /**
   * See developers.google.com/maps/documentation/javascript/reference/directions
   * #DirectionsRenderer.getRouteIndex
   */
  getRouteIndex() {
    this._assertInitialized();
    return this.directionsRenderer.getRouteIndex();
  }
  _combineOptions() {
    const options = this._options || {};
    return __spreadProps(__spreadValues({}, options), {
      directions: this._directions || options.directions,
      map: this._googleMap.googleMap
    });
  }
  _assertInitialized() {
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      if (!this.directionsRenderer) {
        throw Error("Cannot interact with a Google Map Directions Renderer before it has been initialized. Please wait for the Directions Renderer to load before trying to interact with it.");
      }
    }
  }
};
_MapDirectionsRenderer.ɵfac = function MapDirectionsRenderer_Factory(t) {
  return new (t || _MapDirectionsRenderer)(ɵɵdirectiveInject(GoogleMap), ɵɵdirectiveInject(NgZone));
};
_MapDirectionsRenderer.ɵdir = ɵɵdefineDirective({
  type: _MapDirectionsRenderer,
  selectors: [["map-directions-renderer"]],
  inputs: {
    directions: "directions",
    options: "options"
  },
  outputs: {
    directionsChanged: "directionsChanged",
    directionsRendererInitialized: "directionsRendererInitialized"
  },
  exportAs: ["mapDirectionsRenderer"],
  standalone: true,
  features: [ɵɵNgOnChangesFeature]
});
var MapDirectionsRenderer = _MapDirectionsRenderer;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MapDirectionsRenderer, [{
    type: Directive,
    args: [{
      selector: "map-directions-renderer",
      exportAs: "mapDirectionsRenderer",
      standalone: true
    }]
  }], () => [{
    type: GoogleMap
  }, {
    type: NgZone
  }], {
    directions: [{
      type: Input
    }],
    options: [{
      type: Input
    }],
    directionsChanged: [{
      type: Output
    }],
    directionsRendererInitialized: [{
      type: Output
    }]
  });
})();
var _MapGroundOverlay = class _MapGroundOverlay {
  /** URL of the image that will be shown in the overlay. */
  set url(url) {
    this._url.next(url);
  }
  /** Bounds for the overlay. */
  get bounds() {
    return this._bounds.value;
  }
  set bounds(bounds) {
    this._bounds.next(bounds);
  }
  /** Opacity of the overlay. */
  set opacity(opacity) {
    this._opacity.next(opacity);
  }
  constructor(_map, _ngZone) {
    this._map = _map;
    this._ngZone = _ngZone;
    this._eventManager = new MapEventManager(inject(NgZone));
    this._opacity = new BehaviorSubject(1);
    this._url = new BehaviorSubject("");
    this._bounds = new BehaviorSubject(void 0);
    this._destroyed = new Subject();
    this.clickable = false;
    this.mapClick = this._eventManager.getLazyEmitter("click");
    this.mapDblclick = this._eventManager.getLazyEmitter("dblclick");
    this.groundOverlayInitialized = new EventEmitter();
  }
  ngOnInit() {
    if (this._map._isBrowser) {
      this._bounds.pipe(takeUntil(this._destroyed)).subscribe((bounds) => {
        if (this.groundOverlay) {
          this.groundOverlay.setMap(null);
          this.groundOverlay = void 0;
        }
        if (!bounds) {
          return;
        }
        if (google.maps.GroundOverlay && this._map.googleMap) {
          this._initialize(this._map.googleMap, google.maps.GroundOverlay, bounds);
        } else {
          this._ngZone.runOutsideAngular(() => {
            Promise.all([this._map._resolveMap(), google.maps.importLibrary("maps")]).then(([map2, lib]) => {
              this._initialize(map2, lib.GroundOverlay, bounds);
            });
          });
        }
      });
    }
  }
  _initialize(map2, overlayConstructor, bounds) {
    this._ngZone.runOutsideAngular(() => {
      this.groundOverlay = new overlayConstructor(this._url.getValue(), bounds, {
        clickable: this.clickable,
        opacity: this._opacity.value
      });
      this._assertInitialized();
      this.groundOverlay.setMap(map2);
      this._eventManager.setTarget(this.groundOverlay);
      this.groundOverlayInitialized.emit(this.groundOverlay);
      if (!this._hasWatchers) {
        this._hasWatchers = true;
        this._watchForOpacityChanges();
        this._watchForUrlChanges();
      }
    });
  }
  ngOnDestroy() {
    this._eventManager.destroy();
    this._destroyed.next();
    this._destroyed.complete();
    this.groundOverlay?.setMap(null);
  }
  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/image-overlay
   * #GroundOverlay.getBounds
   */
  getBounds() {
    this._assertInitialized();
    return this.groundOverlay.getBounds();
  }
  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/image-overlay
   * #GroundOverlay.getOpacity
   */
  getOpacity() {
    this._assertInitialized();
    return this.groundOverlay.getOpacity();
  }
  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/image-overlay
   * #GroundOverlay.getUrl
   */
  getUrl() {
    this._assertInitialized();
    return this.groundOverlay.getUrl();
  }
  _watchForOpacityChanges() {
    this._opacity.pipe(takeUntil(this._destroyed)).subscribe((opacity) => {
      if (opacity != null) {
        this.groundOverlay?.setOpacity(opacity);
      }
    });
  }
  _watchForUrlChanges() {
    this._url.pipe(takeUntil(this._destroyed)).subscribe((url) => {
      const overlay = this.groundOverlay;
      if (overlay) {
        overlay.set("url", url);
        overlay.setMap(null);
        overlay.setMap(this._map.googleMap);
      }
    });
  }
  _assertInitialized() {
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      if (!this.groundOverlay) {
        throw Error("Cannot interact with a Google Map GroundOverlay before it has been initialized. Please wait for the GroundOverlay to load before trying to interact with it.");
      }
    }
  }
};
_MapGroundOverlay.ɵfac = function MapGroundOverlay_Factory(t) {
  return new (t || _MapGroundOverlay)(ɵɵdirectiveInject(GoogleMap), ɵɵdirectiveInject(NgZone));
};
_MapGroundOverlay.ɵdir = ɵɵdefineDirective({
  type: _MapGroundOverlay,
  selectors: [["map-ground-overlay"]],
  inputs: {
    url: "url",
    bounds: "bounds",
    clickable: "clickable",
    opacity: "opacity"
  },
  outputs: {
    mapClick: "mapClick",
    mapDblclick: "mapDblclick",
    groundOverlayInitialized: "groundOverlayInitialized"
  },
  exportAs: ["mapGroundOverlay"],
  standalone: true
});
var MapGroundOverlay = _MapGroundOverlay;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MapGroundOverlay, [{
    type: Directive,
    args: [{
      selector: "map-ground-overlay",
      exportAs: "mapGroundOverlay",
      standalone: true
    }]
  }], () => [{
    type: GoogleMap
  }, {
    type: NgZone
  }], {
    url: [{
      type: Input
    }],
    bounds: [{
      type: Input
    }],
    clickable: [{
      type: Input
    }],
    opacity: [{
      type: Input
    }],
    mapClick: [{
      type: Output
    }],
    mapDblclick: [{
      type: Output
    }],
    groundOverlayInitialized: [{
      type: Output
    }]
  });
})();
var _MapInfoWindow = class _MapInfoWindow {
  set options(options) {
    this._options.next(options || {});
  }
  set position(position) {
    this._position.next(position);
  }
  constructor(_googleMap, _elementRef, _ngZone) {
    this._googleMap = _googleMap;
    this._elementRef = _elementRef;
    this._ngZone = _ngZone;
    this._eventManager = new MapEventManager(inject(NgZone));
    this._options = new BehaviorSubject({});
    this._position = new BehaviorSubject(void 0);
    this._destroy = new Subject();
    this.closeclick = this._eventManager.getLazyEmitter("closeclick");
    this.contentChanged = this._eventManager.getLazyEmitter("content_changed");
    this.domready = this._eventManager.getLazyEmitter("domready");
    this.positionChanged = this._eventManager.getLazyEmitter("position_changed");
    this.zindexChanged = this._eventManager.getLazyEmitter("zindex_changed");
    this.infoWindowInitialized = new EventEmitter();
  }
  ngOnInit() {
    if (this._googleMap._isBrowser) {
      this._combineOptions().pipe(take(1)).subscribe((options) => {
        if (google.maps.InfoWindow) {
          this._initialize(google.maps.InfoWindow, options);
        } else {
          this._ngZone.runOutsideAngular(() => {
            google.maps.importLibrary("maps").then((lib) => {
              this._initialize(lib.InfoWindow, options);
            });
          });
        }
      });
    }
  }
  _initialize(infoWindowConstructor, options) {
    this._ngZone.runOutsideAngular(() => {
      this.infoWindow = new infoWindowConstructor(options);
      this._eventManager.setTarget(this.infoWindow);
      this.infoWindowInitialized.emit(this.infoWindow);
      this._watchForOptionsChanges();
      this._watchForPositionChanges();
    });
  }
  ngOnDestroy() {
    this._eventManager.destroy();
    this._destroy.next();
    this._destroy.complete();
    if (this.infoWindow) {
      this.close();
    }
  }
  /**
   * See developers.google.com/maps/documentation/javascript/reference/info-window#InfoWindow.close
   */
  close() {
    this._assertInitialized();
    this.infoWindow.close();
  }
  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/info-window#InfoWindow.getContent
   */
  getContent() {
    this._assertInitialized();
    return this.infoWindow.getContent() || null;
  }
  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/info-window
   * #InfoWindow.getPosition
   */
  getPosition() {
    this._assertInitialized();
    return this.infoWindow.getPosition() || null;
  }
  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/info-window#InfoWindow.getZIndex
   */
  getZIndex() {
    this._assertInitialized();
    return this.infoWindow.getZIndex();
  }
  /**
   * Opens the MapInfoWindow using the provided anchor. If the anchor is not set,
   * then the position property of the options input is used instead.
   */
  open(anchor, shouldFocus) {
    this._assertInitialized();
    const anchorObject = anchor ? anchor.getAnchor() : void 0;
    if (this.infoWindow.get("anchor") !== anchorObject || !anchorObject) {
      this._elementRef.nativeElement.style.display = "";
      this.infoWindow.open({
        map: this._googleMap.googleMap,
        anchor: anchorObject,
        shouldFocus
      });
    }
  }
  _combineOptions() {
    return combineLatest([this._options, this._position]).pipe(map(([options, position]) => {
      const combinedOptions = __spreadProps(__spreadValues({}, options), {
        position: position || options.position,
        content: this._elementRef.nativeElement
      });
      return combinedOptions;
    }));
  }
  _watchForOptionsChanges() {
    this._options.pipe(takeUntil(this._destroy)).subscribe((options) => {
      this._assertInitialized();
      this.infoWindow.setOptions(options);
    });
  }
  _watchForPositionChanges() {
    this._position.pipe(takeUntil(this._destroy)).subscribe((position) => {
      if (position) {
        this._assertInitialized();
        this.infoWindow.setPosition(position);
      }
    });
  }
  _assertInitialized() {
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      if (!this.infoWindow) {
        throw Error("Cannot interact with a Google Map Info Window before it has been initialized. Please wait for the Info Window to load before trying to interact with it.");
      }
    }
  }
};
_MapInfoWindow.ɵfac = function MapInfoWindow_Factory(t) {
  return new (t || _MapInfoWindow)(ɵɵdirectiveInject(GoogleMap), ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(NgZone));
};
_MapInfoWindow.ɵdir = ɵɵdefineDirective({
  type: _MapInfoWindow,
  selectors: [["map-info-window"]],
  hostAttrs: [2, "display", "none"],
  inputs: {
    options: "options",
    position: "position"
  },
  outputs: {
    closeclick: "closeclick",
    contentChanged: "contentChanged",
    domready: "domready",
    positionChanged: "positionChanged",
    zindexChanged: "zindexChanged",
    infoWindowInitialized: "infoWindowInitialized"
  },
  exportAs: ["mapInfoWindow"],
  standalone: true
});
var MapInfoWindow = _MapInfoWindow;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MapInfoWindow, [{
    type: Directive,
    args: [{
      selector: "map-info-window",
      exportAs: "mapInfoWindow",
      standalone: true,
      host: {
        "style": "display: none"
      }
    }]
  }], () => [{
    type: GoogleMap
  }, {
    type: ElementRef
  }, {
    type: NgZone
  }], {
    options: [{
      type: Input
    }],
    position: [{
      type: Input
    }],
    closeclick: [{
      type: Output
    }],
    contentChanged: [{
      type: Output
    }],
    domready: [{
      type: Output
    }],
    positionChanged: [{
      type: Output
    }],
    zindexChanged: [{
      type: Output
    }],
    infoWindowInitialized: [{
      type: Output
    }]
  });
})();
var _MapKmlLayer = class _MapKmlLayer {
  set options(options) {
    this._options.next(options || {});
  }
  set url(url) {
    this._url.next(url);
  }
  constructor(_map, _ngZone) {
    this._map = _map;
    this._ngZone = _ngZone;
    this._eventManager = new MapEventManager(inject(NgZone));
    this._options = new BehaviorSubject({});
    this._url = new BehaviorSubject("");
    this._destroyed = new Subject();
    this.kmlClick = this._eventManager.getLazyEmitter("click");
    this.defaultviewportChanged = this._eventManager.getLazyEmitter("defaultviewport_changed");
    this.statusChanged = this._eventManager.getLazyEmitter("status_changed");
    this.kmlLayerInitialized = new EventEmitter();
  }
  ngOnInit() {
    if (this._map._isBrowser) {
      this._combineOptions().pipe(take(1)).subscribe((options) => {
        if (google.maps.KmlLayer && this._map.googleMap) {
          this._initialize(this._map.googleMap, google.maps.KmlLayer, options);
        } else {
          this._ngZone.runOutsideAngular(() => {
            Promise.all([this._map._resolveMap(), google.maps.importLibrary("maps")]).then(([map2, lib]) => {
              this._initialize(map2, lib.KmlLayer, options);
            });
          });
        }
      });
    }
  }
  _initialize(map2, layerConstructor, options) {
    this._ngZone.runOutsideAngular(() => {
      this.kmlLayer = new layerConstructor(options);
      this._assertInitialized();
      this.kmlLayer.setMap(map2);
      this._eventManager.setTarget(this.kmlLayer);
      this.kmlLayerInitialized.emit(this.kmlLayer);
      this._watchForOptionsChanges();
      this._watchForUrlChanges();
    });
  }
  ngOnDestroy() {
    this._eventManager.destroy();
    this._destroyed.next();
    this._destroyed.complete();
    this.kmlLayer?.setMap(null);
  }
  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/kml#KmlLayer.getDefaultViewport
   */
  getDefaultViewport() {
    this._assertInitialized();
    return this.kmlLayer.getDefaultViewport();
  }
  /**
   * See developers.google.com/maps/documentation/javascript/reference/kml#KmlLayer.getMetadata
   */
  getMetadata() {
    this._assertInitialized();
    return this.kmlLayer.getMetadata();
  }
  /**
   * See developers.google.com/maps/documentation/javascript/reference/kml#KmlLayer.getStatus
   */
  getStatus() {
    this._assertInitialized();
    return this.kmlLayer.getStatus();
  }
  /**
   * See developers.google.com/maps/documentation/javascript/reference/kml#KmlLayer.getUrl
   */
  getUrl() {
    this._assertInitialized();
    return this.kmlLayer.getUrl();
  }
  /**
   * See developers.google.com/maps/documentation/javascript/reference/kml#KmlLayer.getZIndex
   */
  getZIndex() {
    this._assertInitialized();
    return this.kmlLayer.getZIndex();
  }
  _combineOptions() {
    return combineLatest([this._options, this._url]).pipe(map(([options, url]) => {
      const combinedOptions = __spreadProps(__spreadValues({}, options), {
        url: url || options.url
      });
      return combinedOptions;
    }));
  }
  _watchForOptionsChanges() {
    this._options.pipe(takeUntil(this._destroyed)).subscribe((options) => {
      if (this.kmlLayer) {
        this._assertInitialized();
        this.kmlLayer.setOptions(options);
      }
    });
  }
  _watchForUrlChanges() {
    this._url.pipe(takeUntil(this._destroyed)).subscribe((url) => {
      if (url && this.kmlLayer) {
        this._assertInitialized();
        this.kmlLayer.setUrl(url);
      }
    });
  }
  _assertInitialized() {
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      if (!this.kmlLayer) {
        throw Error("Cannot interact with a Google Map KmlLayer before it has been initialized. Please wait for the KmlLayer to load before trying to interact with it.");
      }
    }
  }
};
_MapKmlLayer.ɵfac = function MapKmlLayer_Factory(t) {
  return new (t || _MapKmlLayer)(ɵɵdirectiveInject(GoogleMap), ɵɵdirectiveInject(NgZone));
};
_MapKmlLayer.ɵdir = ɵɵdefineDirective({
  type: _MapKmlLayer,
  selectors: [["map-kml-layer"]],
  inputs: {
    options: "options",
    url: "url"
  },
  outputs: {
    kmlClick: "kmlClick",
    defaultviewportChanged: "defaultviewportChanged",
    statusChanged: "statusChanged",
    kmlLayerInitialized: "kmlLayerInitialized"
  },
  exportAs: ["mapKmlLayer"],
  standalone: true
});
var MapKmlLayer = _MapKmlLayer;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MapKmlLayer, [{
    type: Directive,
    args: [{
      selector: "map-kml-layer",
      exportAs: "mapKmlLayer",
      standalone: true
    }]
  }], () => [{
    type: GoogleMap
  }, {
    type: NgZone
  }], {
    options: [{
      type: Input
    }],
    url: [{
      type: Input
    }],
    kmlClick: [{
      type: Output
    }],
    defaultviewportChanged: [{
      type: Output
    }],
    statusChanged: [{
      type: Output
    }],
    kmlLayerInitialized: [{
      type: Output
    }]
  });
})();
var DEFAULT_MARKER_OPTIONS = {
  position: {
    lat: 37.421995,
    lng: -122.084092
  }
};
var _MapMarker = class _MapMarker {
  /**
   * Title of the marker.
   * See: developers.google.com/maps/documentation/javascript/reference/marker#MarkerOptions.title
   */
  set title(title) {
    this._title = title;
  }
  /**
   * Position of the marker. See:
   * developers.google.com/maps/documentation/javascript/reference/marker#MarkerOptions.position
   */
  set position(position) {
    this._position = position;
  }
  /**
   * Label for the marker.
   * See: developers.google.com/maps/documentation/javascript/reference/marker#MarkerOptions.label
   */
  set label(label) {
    this._label = label;
  }
  /**
   * Whether the marker is clickable. See:
   * developers.google.com/maps/documentation/javascript/reference/marker#MarkerOptions.clickable
   */
  set clickable(clickable) {
    this._clickable = clickable;
  }
  /**
   * Options used to configure the marker.
   * See: developers.google.com/maps/documentation/javascript/reference/marker#MarkerOptions
   */
  set options(options) {
    this._options = options;
  }
  /**
   * Icon to be used for the marker.
   * See: https://developers.google.com/maps/documentation/javascript/reference/marker#Icon
   */
  set icon(icon) {
    this._icon = icon;
  }
  /**
   * Whether the marker is visible.
   * See: developers.google.com/maps/documentation/javascript/reference/marker#MarkerOptions.visible
   */
  set visible(value) {
    this._visible = value;
  }
  constructor(_googleMap, _ngZone) {
    this._googleMap = _googleMap;
    this._ngZone = _ngZone;
    this._eventManager = new MapEventManager(inject(NgZone));
    this.animationChanged = this._eventManager.getLazyEmitter("animation_changed");
    this.mapClick = this._eventManager.getLazyEmitter("click");
    this.clickableChanged = this._eventManager.getLazyEmitter("clickable_changed");
    this.cursorChanged = this._eventManager.getLazyEmitter("cursor_changed");
    this.mapDblclick = this._eventManager.getLazyEmitter("dblclick");
    this.mapDrag = this._eventManager.getLazyEmitter("drag");
    this.mapDragend = this._eventManager.getLazyEmitter("dragend");
    this.draggableChanged = this._eventManager.getLazyEmitter("draggable_changed");
    this.mapDragstart = this._eventManager.getLazyEmitter("dragstart");
    this.flatChanged = this._eventManager.getLazyEmitter("flat_changed");
    this.iconChanged = this._eventManager.getLazyEmitter("icon_changed");
    this.mapMousedown = this._eventManager.getLazyEmitter("mousedown");
    this.mapMouseout = this._eventManager.getLazyEmitter("mouseout");
    this.mapMouseover = this._eventManager.getLazyEmitter("mouseover");
    this.mapMouseup = this._eventManager.getLazyEmitter("mouseup");
    this.positionChanged = this._eventManager.getLazyEmitter("position_changed");
    this.mapRightclick = this._eventManager.getLazyEmitter("rightclick");
    this.shapeChanged = this._eventManager.getLazyEmitter("shape_changed");
    this.titleChanged = this._eventManager.getLazyEmitter("title_changed");
    this.visibleChanged = this._eventManager.getLazyEmitter("visible_changed");
    this.zindexChanged = this._eventManager.getLazyEmitter("zindex_changed");
    this.markerInitialized = new EventEmitter();
  }
  ngOnInit() {
    if (!this._googleMap._isBrowser) {
      return;
    }
    if (google.maps.Marker && this._googleMap.googleMap) {
      this._initialize(this._googleMap.googleMap, google.maps.Marker);
    } else {
      this._ngZone.runOutsideAngular(() => {
        Promise.all([this._googleMap._resolveMap(), google.maps.importLibrary("marker")]).then(([map2, lib]) => {
          this._initialize(map2, lib.Marker);
        });
      });
    }
  }
  _initialize(map2, markerConstructor) {
    this._ngZone.runOutsideAngular(() => {
      this.marker = new markerConstructor(this._combineOptions());
      this._assertInitialized();
      this.marker.setMap(map2);
      this._eventManager.setTarget(this.marker);
      this.markerInitialized.next(this.marker);
    });
  }
  ngOnChanges(changes) {
    const {
      marker,
      _title,
      _position,
      _label,
      _clickable,
      _icon,
      _visible
    } = this;
    if (marker) {
      if (changes["options"]) {
        marker.setOptions(this._combineOptions());
      }
      if (changes["title"] && _title !== void 0) {
        marker.setTitle(_title);
      }
      if (changes["position"] && _position) {
        marker.setPosition(_position);
      }
      if (changes["label"] && _label !== void 0) {
        marker.setLabel(_label);
      }
      if (changes["clickable"] && _clickable !== void 0) {
        marker.setClickable(_clickable);
      }
      if (changes["icon"] && _icon) {
        marker.setIcon(_icon);
      }
      if (changes["visible"] && _visible !== void 0) {
        marker.setVisible(_visible);
      }
    }
  }
  ngOnDestroy() {
    this.markerInitialized.complete();
    this._eventManager.destroy();
    this.marker?.setMap(null);
  }
  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getAnimation
   */
  getAnimation() {
    this._assertInitialized();
    return this.marker.getAnimation() || null;
  }
  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getClickable
   */
  getClickable() {
    this._assertInitialized();
    return this.marker.getClickable();
  }
  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getCursor
   */
  getCursor() {
    this._assertInitialized();
    return this.marker.getCursor() || null;
  }
  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getDraggable
   */
  getDraggable() {
    this._assertInitialized();
    return !!this.marker.getDraggable();
  }
  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getIcon
   */
  getIcon() {
    this._assertInitialized();
    return this.marker.getIcon() || null;
  }
  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getLabel
   */
  getLabel() {
    this._assertInitialized();
    return this.marker.getLabel() || null;
  }
  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getOpacity
   */
  getOpacity() {
    this._assertInitialized();
    return this.marker.getOpacity() || null;
  }
  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getPosition
   */
  getPosition() {
    this._assertInitialized();
    return this.marker.getPosition() || null;
  }
  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getShape
   */
  getShape() {
    this._assertInitialized();
    return this.marker.getShape() || null;
  }
  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getTitle
   */
  getTitle() {
    this._assertInitialized();
    return this.marker.getTitle() || null;
  }
  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getVisible
   */
  getVisible() {
    this._assertInitialized();
    return this.marker.getVisible();
  }
  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/marker#Marker.getZIndex
   */
  getZIndex() {
    this._assertInitialized();
    return this.marker.getZIndex() || null;
  }
  /** Gets the anchor point that can be used to attach other Google Maps objects. */
  getAnchor() {
    this._assertInitialized();
    return this.marker;
  }
  /** Returns a promise that resolves when the marker has been initialized. */
  _resolveMarker() {
    return this.marker ? Promise.resolve(this.marker) : this.markerInitialized.pipe(take(1)).toPromise();
  }
  /** Creates a combined options object using the passed-in options and the individual inputs. */
  _combineOptions() {
    const options = this._options || DEFAULT_MARKER_OPTIONS;
    return __spreadProps(__spreadValues({}, options), {
      title: this._title || options.title,
      position: this._position || options.position,
      label: this._label || options.label,
      clickable: this._clickable ?? options.clickable,
      map: this._googleMap.googleMap,
      icon: this._icon || options.icon,
      visible: this._visible ?? options.visible
    });
  }
  _assertInitialized() {
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      if (!this.marker) {
        throw Error("Cannot interact with a Google Map Marker before it has been initialized. Please wait for the Marker to load before trying to interact with it.");
      }
    }
  }
};
_MapMarker.ɵfac = function MapMarker_Factory(t) {
  return new (t || _MapMarker)(ɵɵdirectiveInject(GoogleMap), ɵɵdirectiveInject(NgZone));
};
_MapMarker.ɵdir = ɵɵdefineDirective({
  type: _MapMarker,
  selectors: [["map-marker"]],
  inputs: {
    title: "title",
    position: "position",
    label: "label",
    clickable: "clickable",
    options: "options",
    icon: "icon",
    visible: "visible"
  },
  outputs: {
    animationChanged: "animationChanged",
    mapClick: "mapClick",
    clickableChanged: "clickableChanged",
    cursorChanged: "cursorChanged",
    mapDblclick: "mapDblclick",
    mapDrag: "mapDrag",
    mapDragend: "mapDragend",
    draggableChanged: "draggableChanged",
    mapDragstart: "mapDragstart",
    flatChanged: "flatChanged",
    iconChanged: "iconChanged",
    mapMousedown: "mapMousedown",
    mapMouseout: "mapMouseout",
    mapMouseover: "mapMouseover",
    mapMouseup: "mapMouseup",
    positionChanged: "positionChanged",
    mapRightclick: "mapRightclick",
    shapeChanged: "shapeChanged",
    titleChanged: "titleChanged",
    visibleChanged: "visibleChanged",
    zindexChanged: "zindexChanged",
    markerInitialized: "markerInitialized"
  },
  exportAs: ["mapMarker"],
  standalone: true,
  features: [ɵɵNgOnChangesFeature]
});
var MapMarker = _MapMarker;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MapMarker, [{
    type: Directive,
    args: [{
      selector: "map-marker",
      exportAs: "mapMarker",
      standalone: true
    }]
  }], () => [{
    type: GoogleMap
  }, {
    type: NgZone
  }], {
    title: [{
      type: Input
    }],
    position: [{
      type: Input
    }],
    label: [{
      type: Input
    }],
    clickable: [{
      type: Input
    }],
    options: [{
      type: Input
    }],
    icon: [{
      type: Input
    }],
    visible: [{
      type: Input
    }],
    animationChanged: [{
      type: Output
    }],
    mapClick: [{
      type: Output
    }],
    clickableChanged: [{
      type: Output
    }],
    cursorChanged: [{
      type: Output
    }],
    mapDblclick: [{
      type: Output
    }],
    mapDrag: [{
      type: Output
    }],
    mapDragend: [{
      type: Output
    }],
    draggableChanged: [{
      type: Output
    }],
    mapDragstart: [{
      type: Output
    }],
    flatChanged: [{
      type: Output
    }],
    iconChanged: [{
      type: Output
    }],
    mapMousedown: [{
      type: Output
    }],
    mapMouseout: [{
      type: Output
    }],
    mapMouseover: [{
      type: Output
    }],
    mapMouseup: [{
      type: Output
    }],
    positionChanged: [{
      type: Output
    }],
    mapRightclick: [{
      type: Output
    }],
    shapeChanged: [{
      type: Output
    }],
    titleChanged: [{
      type: Output
    }],
    visibleChanged: [{
      type: Output
    }],
    zindexChanged: [{
      type: Output
    }],
    markerInitialized: [{
      type: Output
    }]
  });
})();
var DEFAULT_CLUSTERER_OPTIONS = {};
var _MapMarkerClusterer = class _MapMarkerClusterer {
  set averageCenter(averageCenter) {
    this._averageCenter = averageCenter;
  }
  set batchSizeIE(batchSizeIE) {
    this._batchSizeIE = batchSizeIE;
  }
  set calculator(calculator) {
    this._calculator = calculator;
  }
  set clusterClass(clusterClass) {
    this._clusterClass = clusterClass;
  }
  set enableRetinaIcons(enableRetinaIcons) {
    this._enableRetinaIcons = enableRetinaIcons;
  }
  set gridSize(gridSize) {
    this._gridSize = gridSize;
  }
  set ignoreHidden(ignoreHidden) {
    this._ignoreHidden = ignoreHidden;
  }
  set imageExtension(imageExtension) {
    this._imageExtension = imageExtension;
  }
  set imagePath(imagePath) {
    this._imagePath = imagePath;
  }
  set imageSizes(imageSizes) {
    this._imageSizes = imageSizes;
  }
  set maxZoom(maxZoom) {
    this._maxZoom = maxZoom;
  }
  set minimumClusterSize(minimumClusterSize) {
    this._minimumClusterSize = minimumClusterSize;
  }
  set styles(styles) {
    this._styles = styles;
  }
  set title(title) {
    this._title = title;
  }
  set zIndex(zIndex) {
    this._zIndex = zIndex;
  }
  set zoomOnClick(zoomOnClick) {
    this._zoomOnClick = zoomOnClick;
  }
  set options(options) {
    this._options = options;
  }
  constructor(_googleMap, _ngZone) {
    this._googleMap = _googleMap;
    this._ngZone = _ngZone;
    this._currentMarkers = /* @__PURE__ */ new Set();
    this._eventManager = new MapEventManager(inject(NgZone));
    this._destroy = new Subject();
    this.ariaLabelFn = () => "";
    this.clusteringbegin = this._eventManager.getLazyEmitter("clusteringbegin");
    this.clusteringend = this._eventManager.getLazyEmitter("clusteringend");
    this.clusterClick = this._eventManager.getLazyEmitter("click");
    this.markerClustererInitialized = new EventEmitter();
    this._canInitialize = _googleMap._isBrowser;
  }
  ngOnInit() {
    if (this._canInitialize) {
      this._ngZone.runOutsideAngular(() => {
        this._googleMap._resolveMap().then((map2) => {
          if (typeof MarkerClusterer !== "function" && (typeof ngDevMode === "undefined" || ngDevMode)) {
            throw Error("MarkerClusterer class not found, cannot construct a marker cluster. Please install the MarkerClustererPlus library: https://github.com/googlemaps/js-markerclustererplus");
          }
          this.markerClusterer = this._ngZone.runOutsideAngular(() => {
            return new MarkerClusterer(map2, [], this._combineOptions());
          });
          this._assertInitialized();
          this._eventManager.setTarget(this.markerClusterer);
          this.markerClustererInitialized.emit(this.markerClusterer);
        });
      });
    }
  }
  ngAfterContentInit() {
    if (this._canInitialize) {
      if (this.markerClusterer) {
        this._watchForMarkerChanges();
      } else {
        this.markerClustererInitialized.pipe(take(1), takeUntil(this._destroy)).subscribe(() => this._watchForMarkerChanges());
      }
    }
  }
  ngOnChanges(changes) {
    const {
      markerClusterer: clusterer,
      ariaLabelFn,
      _averageCenter,
      _batchSizeIE,
      _calculator,
      _styles,
      _clusterClass,
      _enableRetinaIcons,
      _gridSize,
      _ignoreHidden,
      _imageExtension,
      _imagePath,
      _imageSizes,
      _maxZoom,
      _minimumClusterSize,
      _title,
      _zIndex,
      _zoomOnClick
    } = this;
    if (clusterer) {
      if (changes["options"]) {
        clusterer.setOptions(this._combineOptions());
      }
      if (changes["ariaLabelFn"]) {
        clusterer.ariaLabelFn = ariaLabelFn;
      }
      if (changes["averageCenter"] && _averageCenter !== void 0) {
        clusterer.setAverageCenter(_averageCenter);
      }
      if (changes["batchSizeIE"] && _batchSizeIE !== void 0) {
        clusterer.setBatchSizeIE(_batchSizeIE);
      }
      if (changes["calculator"] && !!_calculator) {
        clusterer.setCalculator(_calculator);
      }
      if (changes["clusterClass"] && _clusterClass !== void 0) {
        clusterer.setClusterClass(_clusterClass);
      }
      if (changes["enableRetinaIcons"] && _enableRetinaIcons !== void 0) {
        clusterer.setEnableRetinaIcons(_enableRetinaIcons);
      }
      if (changes["gridSize"] && _gridSize !== void 0) {
        clusterer.setGridSize(_gridSize);
      }
      if (changes["ignoreHidden"] && _ignoreHidden !== void 0) {
        clusterer.setIgnoreHidden(_ignoreHidden);
      }
      if (changes["imageExtension"] && _imageExtension !== void 0) {
        clusterer.setImageExtension(_imageExtension);
      }
      if (changes["imagePath"] && _imagePath !== void 0) {
        clusterer.setImagePath(_imagePath);
      }
      if (changes["imageSizes"] && _imageSizes) {
        clusterer.setImageSizes(_imageSizes);
      }
      if (changes["maxZoom"] && _maxZoom !== void 0) {
        clusterer.setMaxZoom(_maxZoom);
      }
      if (changes["minimumClusterSize"] && _minimumClusterSize !== void 0) {
        clusterer.setMinimumClusterSize(_minimumClusterSize);
      }
      if (changes["styles"] && _styles) {
        clusterer.setStyles(_styles);
      }
      if (changes["title"] && _title !== void 0) {
        clusterer.setTitle(_title);
      }
      if (changes["zIndex"] && _zIndex !== void 0) {
        clusterer.setZIndex(_zIndex);
      }
      if (changes["zoomOnClick"] && _zoomOnClick !== void 0) {
        clusterer.setZoomOnClick(_zoomOnClick);
      }
    }
  }
  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
    this._eventManager.destroy();
    this.markerClusterer?.setMap(null);
  }
  fitMapToMarkers(padding) {
    this._assertInitialized();
    this.markerClusterer.fitMapToMarkers(padding);
  }
  getAverageCenter() {
    this._assertInitialized();
    return this.markerClusterer.getAverageCenter();
  }
  getBatchSizeIE() {
    this._assertInitialized();
    return this.markerClusterer.getBatchSizeIE();
  }
  getCalculator() {
    this._assertInitialized();
    return this.markerClusterer.getCalculator();
  }
  getClusterClass() {
    this._assertInitialized();
    return this.markerClusterer.getClusterClass();
  }
  getClusters() {
    this._assertInitialized();
    return this.markerClusterer.getClusters();
  }
  getEnableRetinaIcons() {
    this._assertInitialized();
    return this.markerClusterer.getEnableRetinaIcons();
  }
  getGridSize() {
    this._assertInitialized();
    return this.markerClusterer.getGridSize();
  }
  getIgnoreHidden() {
    this._assertInitialized();
    return this.markerClusterer.getIgnoreHidden();
  }
  getImageExtension() {
    this._assertInitialized();
    return this.markerClusterer.getImageExtension();
  }
  getImagePath() {
    this._assertInitialized();
    return this.markerClusterer.getImagePath();
  }
  getImageSizes() {
    this._assertInitialized();
    return this.markerClusterer.getImageSizes();
  }
  getMaxZoom() {
    this._assertInitialized();
    return this.markerClusterer.getMaxZoom();
  }
  getMinimumClusterSize() {
    this._assertInitialized();
    return this.markerClusterer.getMinimumClusterSize();
  }
  getStyles() {
    this._assertInitialized();
    return this.markerClusterer.getStyles();
  }
  getTitle() {
    this._assertInitialized();
    return this.markerClusterer.getTitle();
  }
  getTotalClusters() {
    this._assertInitialized();
    return this.markerClusterer.getTotalClusters();
  }
  getTotalMarkers() {
    this._assertInitialized();
    return this.markerClusterer.getTotalMarkers();
  }
  getZIndex() {
    this._assertInitialized();
    return this.markerClusterer.getZIndex();
  }
  getZoomOnClick() {
    this._assertInitialized();
    return this.markerClusterer.getZoomOnClick();
  }
  _combineOptions() {
    const options = this._options || DEFAULT_CLUSTERER_OPTIONS;
    return __spreadProps(__spreadValues({}, options), {
      ariaLabelFn: this.ariaLabelFn ?? options.ariaLabelFn,
      averageCenter: this._averageCenter ?? options.averageCenter,
      batchSize: this.batchSize ?? options.batchSize,
      batchSizeIE: this._batchSizeIE ?? options.batchSizeIE,
      calculator: this._calculator ?? options.calculator,
      clusterClass: this._clusterClass ?? options.clusterClass,
      enableRetinaIcons: this._enableRetinaIcons ?? options.enableRetinaIcons,
      gridSize: this._gridSize ?? options.gridSize,
      ignoreHidden: this._ignoreHidden ?? options.ignoreHidden,
      imageExtension: this._imageExtension ?? options.imageExtension,
      imagePath: this._imagePath ?? options.imagePath,
      imageSizes: this._imageSizes ?? options.imageSizes,
      maxZoom: this._maxZoom ?? options.maxZoom,
      minimumClusterSize: this._minimumClusterSize ?? options.minimumClusterSize,
      styles: this._styles ?? options.styles,
      title: this._title ?? options.title,
      zIndex: this._zIndex ?? options.zIndex,
      zoomOnClick: this._zoomOnClick ?? options.zoomOnClick
    });
  }
  _watchForMarkerChanges() {
    this._assertInitialized();
    this._ngZone.runOutsideAngular(() => {
      this._getInternalMarkers(this._markers).then((markers) => {
        const initialMarkers = [];
        for (const marker of markers) {
          this._currentMarkers.add(marker);
          initialMarkers.push(marker);
        }
        this.markerClusterer.addMarkers(initialMarkers);
      });
    });
    this._markers.changes.pipe(takeUntil(this._destroy)).subscribe((markerComponents) => {
      this._assertInitialized();
      this._ngZone.runOutsideAngular(() => {
        this._getInternalMarkers(markerComponents).then((markers) => {
          const newMarkers = new Set(markers);
          const markersToAdd = [];
          const markersToRemove = [];
          for (const marker of Array.from(newMarkers)) {
            if (!this._currentMarkers.has(marker)) {
              this._currentMarkers.add(marker);
              markersToAdd.push(marker);
            }
          }
          for (const marker of Array.from(this._currentMarkers)) {
            if (!newMarkers.has(marker)) {
              markersToRemove.push(marker);
            }
          }
          this.markerClusterer.addMarkers(markersToAdd, true);
          this.markerClusterer.removeMarkers(markersToRemove, true);
          this.markerClusterer.repaint();
          for (const marker of markersToRemove) {
            this._currentMarkers.delete(marker);
          }
        });
      });
    });
  }
  _getInternalMarkers(markers) {
    return Promise.all(markers.map((markerComponent) => markerComponent._resolveMarker()));
  }
  _assertInitialized() {
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      if (!this.markerClusterer) {
        throw Error("Cannot interact with a MarkerClusterer before it has been initialized. Please wait for the MarkerClusterer to load before trying to interact with it.");
      }
    }
  }
};
_MapMarkerClusterer.ɵfac = function MapMarkerClusterer_Factory(t) {
  return new (t || _MapMarkerClusterer)(ɵɵdirectiveInject(GoogleMap), ɵɵdirectiveInject(NgZone));
};
_MapMarkerClusterer.ɵcmp = ɵɵdefineComponent({
  type: _MapMarkerClusterer,
  selectors: [["map-marker-clusterer"]],
  contentQueries: function MapMarkerClusterer_ContentQueries(rf, ctx, dirIndex) {
    if (rf & 1) {
      ɵɵcontentQuery(dirIndex, MapMarker, 5);
    }
    if (rf & 2) {
      let _t;
      ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx._markers = _t);
    }
  },
  inputs: {
    ariaLabelFn: "ariaLabelFn",
    averageCenter: "averageCenter",
    batchSize: "batchSize",
    batchSizeIE: "batchSizeIE",
    calculator: "calculator",
    clusterClass: "clusterClass",
    enableRetinaIcons: "enableRetinaIcons",
    gridSize: "gridSize",
    ignoreHidden: "ignoreHidden",
    imageExtension: "imageExtension",
    imagePath: "imagePath",
    imageSizes: "imageSizes",
    maxZoom: "maxZoom",
    minimumClusterSize: "minimumClusterSize",
    styles: "styles",
    title: "title",
    zIndex: "zIndex",
    zoomOnClick: "zoomOnClick",
    options: "options"
  },
  outputs: {
    clusteringbegin: "clusteringbegin",
    clusteringend: "clusteringend",
    clusterClick: "clusterClick",
    markerClustererInitialized: "markerClustererInitialized"
  },
  exportAs: ["mapMarkerClusterer"],
  standalone: true,
  features: [ɵɵNgOnChangesFeature, ɵɵStandaloneFeature],
  ngContentSelectors: _c0,
  decls: 1,
  vars: 0,
  template: function MapMarkerClusterer_Template(rf, ctx) {
    if (rf & 1) {
      ɵɵprojectionDef();
      ɵɵprojection(0);
    }
  },
  encapsulation: 2,
  changeDetection: 0
});
var MapMarkerClusterer = _MapMarkerClusterer;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MapMarkerClusterer, [{
    type: Component,
    args: [{
      selector: "map-marker-clusterer",
      exportAs: "mapMarkerClusterer",
      changeDetection: ChangeDetectionStrategy.OnPush,
      standalone: true,
      template: "<ng-content />",
      encapsulation: ViewEncapsulation$1.None
    }]
  }], () => [{
    type: GoogleMap
  }, {
    type: NgZone
  }], {
    ariaLabelFn: [{
      type: Input
    }],
    averageCenter: [{
      type: Input
    }],
    batchSize: [{
      type: Input
    }],
    batchSizeIE: [{
      type: Input
    }],
    calculator: [{
      type: Input
    }],
    clusterClass: [{
      type: Input
    }],
    enableRetinaIcons: [{
      type: Input
    }],
    gridSize: [{
      type: Input
    }],
    ignoreHidden: [{
      type: Input
    }],
    imageExtension: [{
      type: Input
    }],
    imagePath: [{
      type: Input
    }],
    imageSizes: [{
      type: Input
    }],
    maxZoom: [{
      type: Input
    }],
    minimumClusterSize: [{
      type: Input
    }],
    styles: [{
      type: Input
    }],
    title: [{
      type: Input
    }],
    zIndex: [{
      type: Input
    }],
    zoomOnClick: [{
      type: Input
    }],
    options: [{
      type: Input
    }],
    clusteringbegin: [{
      type: Output
    }],
    clusteringend: [{
      type: Output
    }],
    clusterClick: [{
      type: Output
    }],
    _markers: [{
      type: ContentChildren,
      args: [MapMarker, {
        descendants: true
      }]
    }],
    markerClustererInitialized: [{
      type: Output
    }]
  });
})();
var _MapPolygon = class _MapPolygon {
  set options(options) {
    this._options.next(options || {});
  }
  set paths(paths) {
    this._paths.next(paths);
  }
  constructor(_map, _ngZone) {
    this._map = _map;
    this._ngZone = _ngZone;
    this._eventManager = new MapEventManager(inject(NgZone));
    this._options = new BehaviorSubject({});
    this._paths = new BehaviorSubject(void 0);
    this._destroyed = new Subject();
    this.polygonClick = this._eventManager.getLazyEmitter("click");
    this.polygonDblclick = this._eventManager.getLazyEmitter("dblclick");
    this.polygonDrag = this._eventManager.getLazyEmitter("drag");
    this.polygonDragend = this._eventManager.getLazyEmitter("dragend");
    this.polygonDragstart = this._eventManager.getLazyEmitter("dragstart");
    this.polygonMousedown = this._eventManager.getLazyEmitter("mousedown");
    this.polygonMousemove = this._eventManager.getLazyEmitter("mousemove");
    this.polygonMouseout = this._eventManager.getLazyEmitter("mouseout");
    this.polygonMouseover = this._eventManager.getLazyEmitter("mouseover");
    this.polygonMouseup = this._eventManager.getLazyEmitter("mouseup");
    this.polygonRightclick = this._eventManager.getLazyEmitter("rightclick");
    this.polygonInitialized = new EventEmitter();
  }
  ngOnInit() {
    if (this._map._isBrowser) {
      this._combineOptions().pipe(take(1)).subscribe((options) => {
        if (google.maps.Polygon && this._map.googleMap) {
          this._initialize(this._map.googleMap, google.maps.Polygon, options);
        } else {
          this._ngZone.runOutsideAngular(() => {
            Promise.all([this._map._resolveMap(), google.maps.importLibrary("maps")]).then(([map2, lib]) => {
              this._initialize(map2, lib.Polygon, options);
            });
          });
        }
      });
    }
  }
  _initialize(map2, polygonConstructor, options) {
    this._ngZone.runOutsideAngular(() => {
      this.polygon = new polygonConstructor(options);
      this._assertInitialized();
      this.polygon.setMap(map2);
      this._eventManager.setTarget(this.polygon);
      this.polygonInitialized.emit(this.polygon);
      this._watchForOptionsChanges();
      this._watchForPathChanges();
    });
  }
  ngOnDestroy() {
    this._eventManager.destroy();
    this._destroyed.next();
    this._destroyed.complete();
    this.polygon?.setMap(null);
  }
  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/polygon#Polygon.getDraggable
   */
  getDraggable() {
    this._assertInitialized();
    return this.polygon.getDraggable();
  }
  /**
   * See developers.google.com/maps/documentation/javascript/reference/polygon#Polygon.getEditable
   */
  getEditable() {
    this._assertInitialized();
    return this.polygon.getEditable();
  }
  /**
   * See developers.google.com/maps/documentation/javascript/reference/polygon#Polygon.getPath
   */
  getPath() {
    this._assertInitialized();
    return this.polygon.getPath();
  }
  /**
   * See developers.google.com/maps/documentation/javascript/reference/polygon#Polygon.getPaths
   */
  getPaths() {
    this._assertInitialized();
    return this.polygon.getPaths();
  }
  /**
   * See developers.google.com/maps/documentation/javascript/reference/polygon#Polygon.getVisible
   */
  getVisible() {
    this._assertInitialized();
    return this.polygon.getVisible();
  }
  _combineOptions() {
    return combineLatest([this._options, this._paths]).pipe(map(([options, paths]) => {
      const combinedOptions = __spreadProps(__spreadValues({}, options), {
        paths: paths || options.paths
      });
      return combinedOptions;
    }));
  }
  _watchForOptionsChanges() {
    this._options.pipe(takeUntil(this._destroyed)).subscribe((options) => {
      this._assertInitialized();
      this.polygon.setOptions(options);
    });
  }
  _watchForPathChanges() {
    this._paths.pipe(takeUntil(this._destroyed)).subscribe((paths) => {
      if (paths) {
        this._assertInitialized();
        this.polygon.setPaths(paths);
      }
    });
  }
  _assertInitialized() {
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      if (!this.polygon) {
        throw Error("Cannot interact with a Google Map Polygon before it has been initialized. Please wait for the Polygon to load before trying to interact with it.");
      }
    }
  }
};
_MapPolygon.ɵfac = function MapPolygon_Factory(t) {
  return new (t || _MapPolygon)(ɵɵdirectiveInject(GoogleMap), ɵɵdirectiveInject(NgZone));
};
_MapPolygon.ɵdir = ɵɵdefineDirective({
  type: _MapPolygon,
  selectors: [["map-polygon"]],
  inputs: {
    options: "options",
    paths: "paths"
  },
  outputs: {
    polygonClick: "polygonClick",
    polygonDblclick: "polygonDblclick",
    polygonDrag: "polygonDrag",
    polygonDragend: "polygonDragend",
    polygonDragstart: "polygonDragstart",
    polygonMousedown: "polygonMousedown",
    polygonMousemove: "polygonMousemove",
    polygonMouseout: "polygonMouseout",
    polygonMouseover: "polygonMouseover",
    polygonMouseup: "polygonMouseup",
    polygonRightclick: "polygonRightclick",
    polygonInitialized: "polygonInitialized"
  },
  exportAs: ["mapPolygon"],
  standalone: true
});
var MapPolygon = _MapPolygon;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MapPolygon, [{
    type: Directive,
    args: [{
      selector: "map-polygon",
      exportAs: "mapPolygon",
      standalone: true
    }]
  }], () => [{
    type: GoogleMap
  }, {
    type: NgZone
  }], {
    options: [{
      type: Input
    }],
    paths: [{
      type: Input
    }],
    polygonClick: [{
      type: Output
    }],
    polygonDblclick: [{
      type: Output
    }],
    polygonDrag: [{
      type: Output
    }],
    polygonDragend: [{
      type: Output
    }],
    polygonDragstart: [{
      type: Output
    }],
    polygonMousedown: [{
      type: Output
    }],
    polygonMousemove: [{
      type: Output
    }],
    polygonMouseout: [{
      type: Output
    }],
    polygonMouseover: [{
      type: Output
    }],
    polygonMouseup: [{
      type: Output
    }],
    polygonRightclick: [{
      type: Output
    }],
    polygonInitialized: [{
      type: Output
    }]
  });
})();
var _MapPolyline = class _MapPolyline {
  set options(options) {
    this._options.next(options || {});
  }
  set path(path) {
    this._path.next(path);
  }
  constructor(_map, _ngZone) {
    this._map = _map;
    this._ngZone = _ngZone;
    this._eventManager = new MapEventManager(inject(NgZone));
    this._options = new BehaviorSubject({});
    this._path = new BehaviorSubject(void 0);
    this._destroyed = new Subject();
    this.polylineClick = this._eventManager.getLazyEmitter("click");
    this.polylineDblclick = this._eventManager.getLazyEmitter("dblclick");
    this.polylineDrag = this._eventManager.getLazyEmitter("drag");
    this.polylineDragend = this._eventManager.getLazyEmitter("dragend");
    this.polylineDragstart = this._eventManager.getLazyEmitter("dragstart");
    this.polylineMousedown = this._eventManager.getLazyEmitter("mousedown");
    this.polylineMousemove = this._eventManager.getLazyEmitter("mousemove");
    this.polylineMouseout = this._eventManager.getLazyEmitter("mouseout");
    this.polylineMouseover = this._eventManager.getLazyEmitter("mouseover");
    this.polylineMouseup = this._eventManager.getLazyEmitter("mouseup");
    this.polylineRightclick = this._eventManager.getLazyEmitter("rightclick");
    this.polylineInitialized = new EventEmitter();
  }
  ngOnInit() {
    if (this._map._isBrowser) {
      this._combineOptions().pipe(take(1)).subscribe((options) => {
        if (google.maps.Polyline && this._map.googleMap) {
          this._initialize(this._map.googleMap, google.maps.Polyline, options);
        } else {
          this._ngZone.runOutsideAngular(() => {
            Promise.all([this._map._resolveMap(), google.maps.importLibrary("maps")]).then(([map2, lib]) => {
              this._initialize(map2, lib.Polyline, options);
            });
          });
        }
      });
    }
  }
  _initialize(map2, polylineConstructor, options) {
    this._ngZone.runOutsideAngular(() => {
      this.polyline = new polylineConstructor(options);
      this._assertInitialized();
      this.polyline.setMap(map2);
      this._eventManager.setTarget(this.polyline);
      this.polylineInitialized.emit(this.polyline);
      this._watchForOptionsChanges();
      this._watchForPathChanges();
    });
  }
  ngOnDestroy() {
    this._eventManager.destroy();
    this._destroyed.next();
    this._destroyed.complete();
    this.polyline?.setMap(null);
  }
  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.getDraggable
   */
  getDraggable() {
    this._assertInitialized();
    return this.polyline.getDraggable();
  }
  /**
   * See developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.getEditable
   */
  getEditable() {
    this._assertInitialized();
    return this.polyline.getEditable();
  }
  /**
   * See developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.getPath
   */
  getPath() {
    this._assertInitialized();
    return this.polyline.getPath();
  }
  /**
   * See developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.getVisible
   */
  getVisible() {
    this._assertInitialized();
    return this.polyline.getVisible();
  }
  _combineOptions() {
    return combineLatest([this._options, this._path]).pipe(map(([options, path]) => {
      const combinedOptions = __spreadProps(__spreadValues({}, options), {
        path: path || options.path
      });
      return combinedOptions;
    }));
  }
  _watchForOptionsChanges() {
    this._options.pipe(takeUntil(this._destroyed)).subscribe((options) => {
      this._assertInitialized();
      this.polyline.setOptions(options);
    });
  }
  _watchForPathChanges() {
    this._path.pipe(takeUntil(this._destroyed)).subscribe((path) => {
      if (path) {
        this._assertInitialized();
        this.polyline.setPath(path);
      }
    });
  }
  _assertInitialized() {
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      if (!this.polyline) {
        throw Error("Cannot interact with a Google Map Polyline before it has been initialized. Please wait for the Polyline to load before trying to interact with it.");
      }
    }
  }
};
_MapPolyline.ɵfac = function MapPolyline_Factory(t) {
  return new (t || _MapPolyline)(ɵɵdirectiveInject(GoogleMap), ɵɵdirectiveInject(NgZone));
};
_MapPolyline.ɵdir = ɵɵdefineDirective({
  type: _MapPolyline,
  selectors: [["map-polyline"]],
  inputs: {
    options: "options",
    path: "path"
  },
  outputs: {
    polylineClick: "polylineClick",
    polylineDblclick: "polylineDblclick",
    polylineDrag: "polylineDrag",
    polylineDragend: "polylineDragend",
    polylineDragstart: "polylineDragstart",
    polylineMousedown: "polylineMousedown",
    polylineMousemove: "polylineMousemove",
    polylineMouseout: "polylineMouseout",
    polylineMouseover: "polylineMouseover",
    polylineMouseup: "polylineMouseup",
    polylineRightclick: "polylineRightclick",
    polylineInitialized: "polylineInitialized"
  },
  exportAs: ["mapPolyline"],
  standalone: true
});
var MapPolyline = _MapPolyline;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MapPolyline, [{
    type: Directive,
    args: [{
      selector: "map-polyline",
      exportAs: "mapPolyline",
      standalone: true
    }]
  }], () => [{
    type: GoogleMap
  }, {
    type: NgZone
  }], {
    options: [{
      type: Input
    }],
    path: [{
      type: Input
    }],
    polylineClick: [{
      type: Output
    }],
    polylineDblclick: [{
      type: Output
    }],
    polylineDrag: [{
      type: Output
    }],
    polylineDragend: [{
      type: Output
    }],
    polylineDragstart: [{
      type: Output
    }],
    polylineMousedown: [{
      type: Output
    }],
    polylineMousemove: [{
      type: Output
    }],
    polylineMouseout: [{
      type: Output
    }],
    polylineMouseover: [{
      type: Output
    }],
    polylineMouseup: [{
      type: Output
    }],
    polylineRightclick: [{
      type: Output
    }],
    polylineInitialized: [{
      type: Output
    }]
  });
})();
var _MapRectangle = class _MapRectangle {
  set options(options) {
    this._options.next(options || {});
  }
  set bounds(bounds) {
    this._bounds.next(bounds);
  }
  constructor(_map, _ngZone) {
    this._map = _map;
    this._ngZone = _ngZone;
    this._eventManager = new MapEventManager(inject(NgZone));
    this._options = new BehaviorSubject({});
    this._bounds = new BehaviorSubject(void 0);
    this._destroyed = new Subject();
    this.boundsChanged = this._eventManager.getLazyEmitter("bounds_changed");
    this.rectangleClick = this._eventManager.getLazyEmitter("click");
    this.rectangleDblclick = this._eventManager.getLazyEmitter("dblclick");
    this.rectangleDrag = this._eventManager.getLazyEmitter("drag");
    this.rectangleDragend = this._eventManager.getLazyEmitter("dragend");
    this.rectangleDragstart = this._eventManager.getLazyEmitter("dragstart");
    this.rectangleMousedown = this._eventManager.getLazyEmitter("mousedown");
    this.rectangleMousemove = this._eventManager.getLazyEmitter("mousemove");
    this.rectangleMouseout = this._eventManager.getLazyEmitter("mouseout");
    this.rectangleMouseover = this._eventManager.getLazyEmitter("mouseover");
    this.rectangleMouseup = this._eventManager.getLazyEmitter("mouseup");
    this.rectangleRightclick = this._eventManager.getLazyEmitter("rightclick");
    this.rectangleInitialized = new EventEmitter();
  }
  ngOnInit() {
    if (this._map._isBrowser) {
      this._combineOptions().pipe(take(1)).subscribe((options) => {
        if (google.maps.Rectangle && this._map.googleMap) {
          this._initialize(this._map.googleMap, google.maps.Rectangle, options);
        } else {
          this._ngZone.runOutsideAngular(() => {
            Promise.all([this._map._resolveMap(), google.maps.importLibrary("maps")]).then(([map2, lib]) => {
              this._initialize(map2, lib.Rectangle, options);
            });
          });
        }
      });
    }
  }
  _initialize(map2, rectangleConstructor, options) {
    this._ngZone.runOutsideAngular(() => {
      this.rectangle = new rectangleConstructor(options);
      this._assertInitialized();
      this.rectangle.setMap(map2);
      this._eventManager.setTarget(this.rectangle);
      this.rectangleInitialized.emit(this.rectangle);
      this._watchForOptionsChanges();
      this._watchForBoundsChanges();
    });
  }
  ngOnDestroy() {
    this._eventManager.destroy();
    this._destroyed.next();
    this._destroyed.complete();
    this.rectangle?.setMap(null);
  }
  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.getBounds
   */
  getBounds() {
    this._assertInitialized();
    return this.rectangle.getBounds();
  }
  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.getDraggable
   */
  getDraggable() {
    this._assertInitialized();
    return this.rectangle.getDraggable();
  }
  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.getEditable
   */
  getEditable() {
    this._assertInitialized();
    return this.rectangle.getEditable();
  }
  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.getVisible
   */
  getVisible() {
    this._assertInitialized();
    return this.rectangle.getVisible();
  }
  _combineOptions() {
    return combineLatest([this._options, this._bounds]).pipe(map(([options, bounds]) => {
      const combinedOptions = __spreadProps(__spreadValues({}, options), {
        bounds: bounds || options.bounds
      });
      return combinedOptions;
    }));
  }
  _watchForOptionsChanges() {
    this._options.pipe(takeUntil(this._destroyed)).subscribe((options) => {
      this._assertInitialized();
      this.rectangle.setOptions(options);
    });
  }
  _watchForBoundsChanges() {
    this._bounds.pipe(takeUntil(this._destroyed)).subscribe((bounds) => {
      if (bounds) {
        this._assertInitialized();
        this.rectangle.setBounds(bounds);
      }
    });
  }
  _assertInitialized() {
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      if (!this.rectangle) {
        throw Error("Cannot interact with a Google Map Rectangle before it has been initialized. Please wait for the Rectangle to load before trying to interact with it.");
      }
    }
  }
};
_MapRectangle.ɵfac = function MapRectangle_Factory(t) {
  return new (t || _MapRectangle)(ɵɵdirectiveInject(GoogleMap), ɵɵdirectiveInject(NgZone));
};
_MapRectangle.ɵdir = ɵɵdefineDirective({
  type: _MapRectangle,
  selectors: [["map-rectangle"]],
  inputs: {
    options: "options",
    bounds: "bounds"
  },
  outputs: {
    boundsChanged: "boundsChanged",
    rectangleClick: "rectangleClick",
    rectangleDblclick: "rectangleDblclick",
    rectangleDrag: "rectangleDrag",
    rectangleDragend: "rectangleDragend",
    rectangleDragstart: "rectangleDragstart",
    rectangleMousedown: "rectangleMousedown",
    rectangleMousemove: "rectangleMousemove",
    rectangleMouseout: "rectangleMouseout",
    rectangleMouseover: "rectangleMouseover",
    rectangleMouseup: "rectangleMouseup",
    rectangleRightclick: "rectangleRightclick",
    rectangleInitialized: "rectangleInitialized"
  },
  exportAs: ["mapRectangle"],
  standalone: true
});
var MapRectangle = _MapRectangle;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MapRectangle, [{
    type: Directive,
    args: [{
      selector: "map-rectangle",
      exportAs: "mapRectangle",
      standalone: true
    }]
  }], () => [{
    type: GoogleMap
  }, {
    type: NgZone
  }], {
    options: [{
      type: Input
    }],
    bounds: [{
      type: Input
    }],
    boundsChanged: [{
      type: Output
    }],
    rectangleClick: [{
      type: Output
    }],
    rectangleDblclick: [{
      type: Output
    }],
    rectangleDrag: [{
      type: Output
    }],
    rectangleDragend: [{
      type: Output
    }],
    rectangleDragstart: [{
      type: Output
    }],
    rectangleMousedown: [{
      type: Output
    }],
    rectangleMousemove: [{
      type: Output
    }],
    rectangleMouseout: [{
      type: Output
    }],
    rectangleMouseover: [{
      type: Output
    }],
    rectangleMouseup: [{
      type: Output
    }],
    rectangleRightclick: [{
      type: Output
    }],
    rectangleInitialized: [{
      type: Output
    }]
  });
})();
var _MapTrafficLayer = class _MapTrafficLayer {
  /**
   * Whether the traffic layer refreshes with updated information automatically.
   */
  set autoRefresh(autoRefresh) {
    this._autoRefresh.next(autoRefresh);
  }
  constructor(_map, _ngZone) {
    this._map = _map;
    this._ngZone = _ngZone;
    this._autoRefresh = new BehaviorSubject(true);
    this._destroyed = new Subject();
    this.trafficLayerInitialized = new EventEmitter();
  }
  ngOnInit() {
    if (this._map._isBrowser) {
      this._combineOptions().pipe(take(1)).subscribe((options) => {
        if (google.maps.TrafficLayer && this._map.googleMap) {
          this._initialize(this._map.googleMap, google.maps.TrafficLayer, options);
        } else {
          this._ngZone.runOutsideAngular(() => {
            Promise.all([this._map._resolveMap(), google.maps.importLibrary("maps")]).then(([map2, lib]) => {
              this._initialize(map2, lib.TrafficLayer, options);
            });
          });
        }
      });
    }
  }
  _initialize(map2, layerConstructor, options) {
    this._ngZone.runOutsideAngular(() => {
      this.trafficLayer = new layerConstructor(options);
      this._assertInitialized();
      this.trafficLayer.setMap(map2);
      this.trafficLayerInitialized.emit(this.trafficLayer);
      this._watchForAutoRefreshChanges();
    });
  }
  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
    this.trafficLayer?.setMap(null);
  }
  _combineOptions() {
    return this._autoRefresh.pipe(map((autoRefresh) => {
      const combinedOptions = {
        autoRefresh
      };
      return combinedOptions;
    }));
  }
  _watchForAutoRefreshChanges() {
    this._combineOptions().pipe(takeUntil(this._destroyed)).subscribe((options) => {
      this._assertInitialized();
      this.trafficLayer.setOptions(options);
    });
  }
  _assertInitialized() {
    if (!this.trafficLayer) {
      throw Error("Cannot interact with a Google Map Traffic Layer before it has been initialized. Please wait for the Traffic Layer to load before trying to interact with it.");
    }
  }
};
_MapTrafficLayer.ɵfac = function MapTrafficLayer_Factory(t) {
  return new (t || _MapTrafficLayer)(ɵɵdirectiveInject(GoogleMap), ɵɵdirectiveInject(NgZone));
};
_MapTrafficLayer.ɵdir = ɵɵdefineDirective({
  type: _MapTrafficLayer,
  selectors: [["map-traffic-layer"]],
  inputs: {
    autoRefresh: "autoRefresh"
  },
  outputs: {
    trafficLayerInitialized: "trafficLayerInitialized"
  },
  exportAs: ["mapTrafficLayer"],
  standalone: true
});
var MapTrafficLayer = _MapTrafficLayer;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MapTrafficLayer, [{
    type: Directive,
    args: [{
      selector: "map-traffic-layer",
      exportAs: "mapTrafficLayer",
      standalone: true
    }]
  }], () => [{
    type: GoogleMap
  }, {
    type: NgZone
  }], {
    autoRefresh: [{
      type: Input
    }],
    trafficLayerInitialized: [{
      type: Output
    }]
  });
})();
var _MapTransitLayer = class _MapTransitLayer {
  constructor() {
    this._map = inject(GoogleMap);
    this._zone = inject(NgZone);
    this.transitLayerInitialized = new EventEmitter();
  }
  ngOnInit() {
    if (this._map._isBrowser) {
      if (google.maps.TransitLayer && this._map.googleMap) {
        this._initialize(this._map.googleMap, google.maps.TransitLayer);
      } else {
        this._zone.runOutsideAngular(() => {
          Promise.all([this._map._resolveMap(), google.maps.importLibrary("maps")]).then(([map2, lib]) => {
            this._initialize(map2, lib.TransitLayer);
          });
        });
      }
    }
  }
  _initialize(map2, layerConstructor) {
    this._zone.runOutsideAngular(() => {
      this.transitLayer = new layerConstructor();
      this.transitLayerInitialized.emit(this.transitLayer);
      this._assertLayerInitialized();
      this.transitLayer.setMap(map2);
    });
  }
  ngOnDestroy() {
    this.transitLayer?.setMap(null);
  }
  _assertLayerInitialized() {
    if (!this.transitLayer) {
      throw Error("Cannot interact with a Google Map Transit Layer before it has been initialized. Please wait for the Transit Layer to load before trying to interact with it.");
    }
  }
};
_MapTransitLayer.ɵfac = function MapTransitLayer_Factory(t) {
  return new (t || _MapTransitLayer)();
};
_MapTransitLayer.ɵdir = ɵɵdefineDirective({
  type: _MapTransitLayer,
  selectors: [["map-transit-layer"]],
  outputs: {
    transitLayerInitialized: "transitLayerInitialized"
  },
  exportAs: ["mapTransitLayer"],
  standalone: true
});
var MapTransitLayer = _MapTransitLayer;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MapTransitLayer, [{
    type: Directive,
    args: [{
      selector: "map-transit-layer",
      exportAs: "mapTransitLayer",
      standalone: true
    }]
  }], null, {
    transitLayerInitialized: [{
      type: Output
    }]
  });
})();
var _MapHeatmapLayer = class _MapHeatmapLayer {
  /**
   * Data shown on the heatmap.
   * See: https://developers.google.com/maps/documentation/javascript/reference/visualization
   */
  set data(data) {
    this._data = data;
  }
  /**
   * Options used to configure the heatmap. See:
   * developers.google.com/maps/documentation/javascript/reference/visualization#HeatmapLayerOptions
   */
  set options(options) {
    this._options = options;
  }
  constructor(_googleMap, _ngZone) {
    this._googleMap = _googleMap;
    this._ngZone = _ngZone;
    this.heatmapInitialized = new EventEmitter();
  }
  ngOnInit() {
    if (this._googleMap._isBrowser) {
      if (!window.google?.maps?.visualization && !window.google?.maps.importLibrary && (typeof ngDevMode === "undefined" || ngDevMode)) {
        throw Error('Namespace `google.maps.visualization` not found, cannot construct heatmap. Please install the Google Maps JavaScript API with the "visualization" library: https://developers.google.com/maps/documentation/javascript/visualization');
      }
      if (google.maps.visualization?.HeatmapLayer && this._googleMap.googleMap) {
        this._initialize(this._googleMap.googleMap, google.maps.visualization.HeatmapLayer);
      } else {
        this._ngZone.runOutsideAngular(() => {
          Promise.all([this._googleMap._resolveMap(), google.maps.importLibrary("visualization")]).then(([map2, lib]) => {
            this._initialize(map2, lib.HeatmapLayer);
          });
        });
      }
    }
  }
  _initialize(map2, heatmapConstructor) {
    this._ngZone.runOutsideAngular(() => {
      this.heatmap = new heatmapConstructor(this._combineOptions());
      this._assertInitialized();
      this.heatmap.setMap(map2);
      this.heatmapInitialized.emit(this.heatmap);
    });
  }
  ngOnChanges(changes) {
    const {
      _data,
      heatmap
    } = this;
    if (heatmap) {
      if (changes["options"]) {
        heatmap.setOptions(this._combineOptions());
      }
      if (changes["data"] && _data !== void 0) {
        heatmap.setData(this._normalizeData(_data));
      }
    }
  }
  ngOnDestroy() {
    this.heatmap?.setMap(null);
  }
  /**
   * Gets the data that is currently shown on the heatmap.
   * See: developers.google.com/maps/documentation/javascript/reference/visualization#HeatmapLayer
   */
  getData() {
    this._assertInitialized();
    return this.heatmap.getData();
  }
  /** Creates a combined options object using the passed-in options and the individual inputs. */
  _combineOptions() {
    const options = this._options || {};
    return __spreadProps(__spreadValues({}, options), {
      data: this._normalizeData(this._data || options.data || []),
      map: this._googleMap.googleMap
    });
  }
  /**
   * Most Google Maps APIs support both `LatLng` objects and `LatLngLiteral`. The latter is more
   * convenient to write out, because the Google Maps API doesn't have to have been loaded in order
   * to construct them. The `HeatmapLayer` appears to be an exception that only allows a `LatLng`
   * object, or it throws a runtime error. Since it's more convenient and we expect that Angular
   * users will load the API asynchronously, we allow them to pass in a `LatLngLiteral` and we
   * convert it to a `LatLng` object before passing it off to Google Maps.
   */
  _normalizeData(data) {
    const result = [];
    data.forEach((item) => {
      result.push(isLatLngLiteral(item) ? new google.maps.LatLng(item.lat, item.lng) : item);
    });
    return result;
  }
  /** Asserts that the heatmap object has been initialized. */
  _assertInitialized() {
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      if (!this.heatmap) {
        throw Error("Cannot interact with a Google Map HeatmapLayer before it has been initialized. Please wait for the heatmap to load before trying to interact with it.");
      }
    }
  }
};
_MapHeatmapLayer.ɵfac = function MapHeatmapLayer_Factory(t) {
  return new (t || _MapHeatmapLayer)(ɵɵdirectiveInject(GoogleMap), ɵɵdirectiveInject(NgZone));
};
_MapHeatmapLayer.ɵdir = ɵɵdefineDirective({
  type: _MapHeatmapLayer,
  selectors: [["map-heatmap-layer"]],
  inputs: {
    data: "data",
    options: "options"
  },
  outputs: {
    heatmapInitialized: "heatmapInitialized"
  },
  exportAs: ["mapHeatmapLayer"],
  standalone: true,
  features: [ɵɵNgOnChangesFeature]
});
var MapHeatmapLayer = _MapHeatmapLayer;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MapHeatmapLayer, [{
    type: Directive,
    args: [{
      selector: "map-heatmap-layer",
      exportAs: "mapHeatmapLayer",
      standalone: true
    }]
  }], () => [{
    type: GoogleMap
  }, {
    type: NgZone
  }], {
    data: [{
      type: Input
    }],
    options: [{
      type: Input
    }],
    heatmapInitialized: [{
      type: Output
    }]
  });
})();
function isLatLngLiteral(value) {
  return value && typeof value.lat === "number" && typeof value.lng === "number";
}
var COMPONENTS = [GoogleMap, MapBaseLayer, MapBicyclingLayer, MapCircle, MapDirectionsRenderer, MapGroundOverlay, MapHeatmapLayer, MapInfoWindow, MapKmlLayer, MapMarker, MapMarkerClusterer, MapPolygon, MapPolyline, MapRectangle, MapTrafficLayer, MapTransitLayer];
var _GoogleMapsModule = class _GoogleMapsModule {
};
_GoogleMapsModule.ɵfac = function GoogleMapsModule_Factory(t) {
  return new (t || _GoogleMapsModule)();
};
_GoogleMapsModule.ɵmod = ɵɵdefineNgModule({
  type: _GoogleMapsModule,
  imports: [GoogleMap, MapBaseLayer, MapBicyclingLayer, MapCircle, MapDirectionsRenderer, MapGroundOverlay, MapHeatmapLayer, MapInfoWindow, MapKmlLayer, MapMarker, MapMarkerClusterer, MapPolygon, MapPolyline, MapRectangle, MapTrafficLayer, MapTransitLayer],
  exports: [GoogleMap, MapBaseLayer, MapBicyclingLayer, MapCircle, MapDirectionsRenderer, MapGroundOverlay, MapHeatmapLayer, MapInfoWindow, MapKmlLayer, MapMarker, MapMarkerClusterer, MapPolygon, MapPolyline, MapRectangle, MapTrafficLayer, MapTransitLayer]
});
_GoogleMapsModule.ɵinj = ɵɵdefineInjector({});
var GoogleMapsModule = _GoogleMapsModule;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(GoogleMapsModule, [{
    type: NgModule,
    args: [{
      imports: COMPONENTS,
      exports: COMPONENTS
    }]
  }], null, null);
})();
var _MapDirectionsService = class _MapDirectionsService {
  constructor(_ngZone) {
    this._ngZone = _ngZone;
  }
  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/directions
   * #DirectionsService.route
   */
  route(request) {
    return new Observable((observer) => {
      this._getService().then((service) => {
        service.route(request, (result, status) => {
          this._ngZone.run(() => {
            observer.next({
              result: result || void 0,
              status
            });
            observer.complete();
          });
        });
      });
    });
  }
  _getService() {
    if (!this._directionsService) {
      if (google.maps.DirectionsService) {
        this._directionsService = new google.maps.DirectionsService();
      } else {
        return google.maps.importLibrary("routes").then((lib) => {
          this._directionsService = new lib.DirectionsService();
          return this._directionsService;
        });
      }
    }
    return Promise.resolve(this._directionsService);
  }
};
_MapDirectionsService.ɵfac = function MapDirectionsService_Factory(t) {
  return new (t || _MapDirectionsService)(ɵɵinject(NgZone));
};
_MapDirectionsService.ɵprov = ɵɵdefineInjectable({
  token: _MapDirectionsService,
  factory: _MapDirectionsService.ɵfac,
  providedIn: "root"
});
var MapDirectionsService = _MapDirectionsService;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MapDirectionsService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{
    type: NgZone
  }], null);
})();
var _MapGeocoder = class _MapGeocoder {
  constructor(_ngZone) {
    this._ngZone = _ngZone;
  }
  /**
   * See developers.google.com/maps/documentation/javascript/reference/geocoder#Geocoder.geocode
   */
  geocode(request) {
    return new Observable((observer) => {
      this._getGeocoder().then((geocoder) => {
        geocoder.geocode(request, (results, status) => {
          this._ngZone.run(() => {
            observer.next({
              results: results || [],
              status
            });
            observer.complete();
          });
        });
      });
    });
  }
  _getGeocoder() {
    if (!this._geocoder) {
      if (google.maps.Geocoder) {
        this._geocoder = new google.maps.Geocoder();
      } else {
        return google.maps.importLibrary("geocoding").then((lib) => {
          this._geocoder = new lib.Geocoder();
          return this._geocoder;
        });
      }
    }
    return Promise.resolve(this._geocoder);
  }
};
_MapGeocoder.ɵfac = function MapGeocoder_Factory(t) {
  return new (t || _MapGeocoder)(ɵɵinject(NgZone));
};
_MapGeocoder.ɵprov = ɵɵdefineInjectable({
  token: _MapGeocoder,
  factory: _MapGeocoder.ɵfac,
  providedIn: "root"
});
var MapGeocoder = _MapGeocoder;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MapGeocoder, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{
    type: NgZone
  }], null);
})();
export {
  GoogleMap,
  GoogleMapsModule,
  MapBaseLayer,
  MapBicyclingLayer,
  MapCircle,
  MapDirectionsRenderer,
  MapDirectionsService,
  MapEventManager,
  MapGeocoder,
  MapGroundOverlay,
  MapHeatmapLayer,
  MapInfoWindow,
  MapKmlLayer,
  MapMarker,
  MapMarkerClusterer,
  MapPolygon,
  MapPolyline,
  MapRectangle,
  MapTrafficLayer,
  MapTransitLayer
};
//# sourceMappingURL=@angular_google-maps.js.map
