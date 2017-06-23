<div id="header-controls">
  <div id="back-btn" class="pull-left">
    <a data-rel="back" class="icon icon-left-nav" style="color: white;"></a>
  </div>
  <div class="input-group">
    <div class="input-row">
      <button id="location-lock-btn" class="lock-btn icon icon-lock-<%- obj.locationLocked ? 'closed' : 'open' %>"></button>
      <label class="media-object pull-left icon icon-location" for="location-gridref" />
      <input type="text" title="set gridreference" id="location-gridref" placeholder="Grid reference" value="<%- obj.value %>" data-source="<%- obj.locationSource %>" />
    </div>
    <% if (!obj.hideName) { %>
    <div class="input-row" id="location-name-row">
      <button id="name-lock-btn" class="lock-btn icon icon-lock-<%- obj.nameLocked ? 'closed' : 'open' %>"></button>
      <label class="media-object pull-left icon icon-address" for="location-name" />
      <input class="typeahead" type="text" title="set location name" id="location-name" placeholder="Nearest named place" value="<%= obj.locationName %>"/>
    </div>
    <% } %>
  </div>
</div>

<div id="map-container">
  <div id="map" class="<%- obj.hideName ? 'hiddenName' : '' %>"></div>
</div>
