<div id="img-picker-array" class="<%- obj.isSynchronising ? 'disabled' : '' %>">
  <div class="img-picker icon icon-camera">
    <% if (!window.cordova) { %>
    <input type="file" accept="image/*"/>
    <% } %>
  </div>
  <div id="img-array"></div>
</div>
