<div class="info-message">
  <p>We will try to determine your location
    using the inbuilt phone GPS.</p>

  <p> Please make sure you have turned the phone's
    geolocation on and are well away from large objects.<br/> e.g. <i>trees,
      buildings </i></p>
</div>

<div class="warning-message">
  <p>Locking a GPS sourced location will lock the location name only.</p>
</div>

<div class="input-row tt">
  <label class="media-object pull-left icon icon-address"></label>
  <input class="typeahead" type="text" id="location-name" placeholder="Nearest Named Place" value="<%- obj.name %>"/>
</div>

<button id="gps-button"
        class="btn btn-narrow btn-positive btn-block">Locate</button>

