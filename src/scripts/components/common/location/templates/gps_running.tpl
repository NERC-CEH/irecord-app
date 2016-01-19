<div class="info-message">
  <p>We are trying to get your location. This might take a
    few minutes...</p>
  <% if (obj.accuracy) { %>
  <p>Accuracy: <%- obj.accuracy %> meters
    (need less than <%- obj.accuracyLimit %>m)</p>
  <% } %>
</div>

<button id="gps-button"
        class="btn btn-narrow btn-positive btn-block">Stop</button>

