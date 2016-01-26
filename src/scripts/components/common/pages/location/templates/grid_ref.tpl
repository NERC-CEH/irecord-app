<div class="info-message" id="gref-message">
  <p>Please provide a GB Grid Reference.
    <br/> e.g. <i>"TQ 28170 77103"</i></p>
</div>

<div class="input-group">
  <input type="text" id="grid-ref" placeholder="Grid Reference" value="<%- obj.gridref %>" />
  <input type="text" id="location-name" placeholder="Location Name (optional)" value="<%- obj.name %>"/>
</div>

<button id="grid-ref-set-btn"
        class="btn btn-narrow btn-positive btn-block">Set</button>