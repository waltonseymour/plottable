///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class Area extends Line {
    private areaPath: D3.Selection;

    /**
     * Creates an AreaPlot.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: Abstract.Scale, yScale: Abstract.Scale) {
      super(dataset, xScale, yScale);
      this.classed("area-renderer", true);
      this.project("y0", 0, yScale); // default
      this.project("fill", () => "steelblue"); // default
      this.project("stroke", () => "none"); // default
      this._animators["area-reset"] = new Animator.Null();
      this._animators["area"]       = new Animator.Default()
                                        .duration(600)
                                        .easing("exp-in-out");
    }

    public _setup() {
      super._setup();
      this.areaPath = this.renderArea.append("path").classed("area", true);
      return this;
    }

    public _onDataSourceUpdate() {
      super._onDataSourceUpdate();
      if (this.yScale != null) {
        this._updateYDomainer();
      }
    }

    public _updateYDomainer(): Area {
      super._updateYDomainer();
      var scale = <Abstract.QuantitiveScale> this.yScale;

      var y0Projector = this._projectors["y0"];
      var y0Accessor = y0Projector != null ? y0Projector.accessor : null;
      var extent:  number[] = y0Accessor != null ? this.dataSource()._getExtent(y0Accessor) : [];
      var constantBaseline = (extent.length === 2 && extent[0] === extent[1]) ? extent[0] : null;

      if (!scale._userSetDomainer) {
        if (constantBaseline != null) {
          scale.domainer().addPaddingException(constantBaseline, "AREA_PLOT+" + this._plottableID);
        } else {
          scale.domainer().removePaddingException("AREA_PLOT+" + this._plottableID);
        }
        // prepending "AREA_PLOT" is unnecessary but reduces likely of user accidentally creating collisions
        scale._autoDomainIfAutomaticMode();
      }
      return this;
    }

    public project(attrToSet: string, accessor: any, scale?: Abstract.Scale) {
      super.project(attrToSet, accessor, scale);
      if (attrToSet === "y0") {
        this._updateYDomainer();
      }
      return this;
    }

    public _paint() {
      super._paint();
      var attrToProjector = this._generateAttrToProjector();
      var xFunction       = attrToProjector["x"];
      var y0Function      = attrToProjector["y0"];
      var yFunction       = attrToProjector["y"];
      delete attrToProjector["x"];
      delete attrToProjector["y0"];
      delete attrToProjector["y"];

      this.areaPath.datum(this._dataSource.data());

      if (this._dataChanged) {
        attrToProjector["d"] = d3.svg.area()
          .x(xFunction)
          .y0(y0Function)
          .y1(y0Function);
        this._applyAnimatedAttributes(this.areaPath, "area-reset", attrToProjector);
      }

      attrToProjector["d"] = d3.svg.area()
        .x(xFunction)
        .y0(y0Function)
        .y1(yFunction);
      this._applyAnimatedAttributes(this.areaPath, "area", attrToProjector);
    }
  }
}
}
