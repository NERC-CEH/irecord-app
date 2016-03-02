<div class="success-message">
  <p>Success!</p>
  <p>Accuracy: <%- obj.accuracy %> meters</p>
</div>
<div class="input-row">
  <label class="media-object pull-left icon icon-address"></label>
  <input type="text" id="location-name" placeholder="Nearest Named Place" value="<%- obj.name %>"/>
</div>

<button id="gps-button"
        class="btn btn-narrow btn-positive btn-block">Update</button>

