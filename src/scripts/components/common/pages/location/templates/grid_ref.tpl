<div class="info-message" id="gref-message">
  <p>Please provide a GB Grid Reference.
    <br/> e.g. <i>"TQ 28170 77103"</i></p>
</div>

<div class="input-group">
  <div class="input-row">
    <label class="media-object pull-left icon icon-location"></label>
    <input type="text" id="grid-ref" placeholder="Grid Reference" value="<%- obj.gridref %>" />
  </div>
  <div class="input-row">
    <label class="media-object pull-left icon icon-address"></label>
    <input type="text" id="location-name" placeholder="Nearest Named Place" value="<%- obj.name %>"/>
  </div>
</div>

<button id="grid-ref-set-btn"
        class="btn btn-narrow btn-positive btn-block">Set</button>