<div class="info-message">
  <% if (obj.onDatabase) { %>
  <p>This record has been submitted and cannot be edited within this App.
    Go to the <a href="http://192.171.199.230/irecord7" target="_blank">iRecord website</a> to edit.</p>
  <% } else { %>
  <p>This record has been locked for submission and cannot be edited.</p>
  <% }%>
</div>
<ul class="table-view core inputs info no-top">
  <li class="table-view-cell species">
    <p class="descript"><%- obj.taxon %></p>
  </li>
  <li class="table-view-cell">
    <span class="media-object pull-left icon icon-location"></span>
    <div class="media-body">
      <h3 class="heading">Location</h3>
      <p class="descript"><%- obj.location %></p>
    </div>
  </li>
  <li class="table-view-cell">
    <span class="media-object pull-left icon icon-calendar"></span>
    <div class="media-body">
      <h3 class="heading">Date</h3>
      <p class="descript"><%- obj.date %></p>
    </div>
  </li>
  <li class="table-view-cell">
    <span class="media-object pull-left icon icon-number"></span>
    <div class="media-body">
      <h3 class="heading">Number</h3>
      <p class="descript"><%- obj.number %></p>
    </div>
  </li>
  <li class="table-view-cell">
    <span class="media-object pull-left icon icon-stage"></span>
    <div class="media-body">
      <h3 class="heading">Stage</h3>
      <p class="descript"><%- obj.stage %></p>
    </div>
  </li>
  <li class="table-view-cell">
    <span class="media-object pull-left icon icon-comment"></span>
    <div class="media-body">
      <h3 class="heading">Comment</h3>
      <p class="descript comment"><%- obj.comment %></p>
    </div>
  </li>
</ul>

<% if (!obj.onDatabase) { %>
<button id="sync-btn" class="btn btn-narrow btn-positive btn-block <%- obj.isSynchronising ? 'icon-plus icon-spin' : '' %>"
<%- obj.isSynchronising ? 'disabled' : '' %> >Synchronise</button>
<% } %>