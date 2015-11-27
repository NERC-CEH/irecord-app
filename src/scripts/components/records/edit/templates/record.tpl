<ul class="table-view core inputs">
  <li class="table-view-cell">
    <a href="#records/<%- obj.id %>/edit/taxon" id="species-button" class="navigate-right">
      <p class="descript"><%- obj.occurrences[0].attributes.taxon %></p>
    </a>
  </li>
  <li class="table-view-cell">
    <a id="location-button" class="navigate-right">
      <span class="media-object pull-left icon icon-location"></span>
      <div class="media-body">
        <h3 class="heading">Location</h3>
        <p class="descript"></p>
      </div>
    </a>
  </li>
  <li class="table-view-cell">
    <a id="date-button" class="navigate-right">
      <span class="media-object pull-left icon icon-calendar"></span>
      <div class="media-body">
        <h3 class="heading">Date</h3>
        <p class="descript"><%- obj.attributes.date %></p>
      </div>
    </a>
  </li>
</ul>

<ul class="table-view dynamic inputs">
  <li class="table-view-cell">
    <a id="number-button" class="navigate-right">
      <span class="media-object pull-left icon icon-number"></span>
      <div class="media-body">
        <h3 class="heading">Number</h3>
        <p class="descript"></p>
      </div>
    </a>
  </li>
  <li class="table-view-cell">
    <a id="stage-button" class="navigate-right">
      <span class="media-object pull-left icon icon-stage"></span>
      <div class="media-body">
        <h3 class="heading">Stage</h3>
        <p class="descript"></p>
      </div>
    </a>
  </li>
  <li class="table-view-cell">
    <a id="comment-button" class="navigate-right">
      <span class="media-object pull-left icon icon-comment"></span>
      <div class="media-body">
        <h3 class="heading">Comment</h3>
        <p class="descript"></p>
      </div>
    </a>
  </li>
</ul>
