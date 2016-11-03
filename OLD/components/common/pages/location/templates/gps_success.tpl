<div class="success-message">
  <p>Success!</p>
  <p>Accuracy: <%- obj.accuracy %> meters</p>
</div>

<div class="warning-message">
  <p>Locking a GPS sourced location will lock the location name only.</p>
</div>

<div class="input-row tt">
  <label class="media-object pull-left icon icon-address"></label>
  <input class="typeahead" type="text" id="location-name" placeholder="Nearest Named Place" value="<%= obj.name %>"/>
</div>

<button id="gps-button"
        class="btn btn-narrow btn-positive btn-block">Refresh GPS</button>

