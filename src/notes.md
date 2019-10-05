# SPF e-Atlas

Date : 12.06.2019

## Project outcomes

* A web-based 'e-Atlas' (better name possible) for  exploring Turing datasets

* A Turing geo-visualization toolkit -- visualization design guidelines, particularly linking geo-visualization designs to task, recommendations for representing uncertainty data etc.


## What is an e-Atlas?

We discussed some of the characteristics of an e-atlas. Here are some examples (only a few).

### Examples

#### NCIN's UK Cancer e-Atlas

Available at [www.ncin.org](http://www.ncin.org.uk/cancer_information_tools/eatlas/pct/atlas.html?select=Eav&indicator=i0). Displays cancer incidence by LAD.

<img style="width:100%" src="/images/eatlas_ncin.png" alt="NCIN" />

**Components**

* Bar chart : ordered left-to-right on incidence, with decile positions providing context
* Choropleth map : displaying selected cancer incidence
* Middle table : mechamism for selecting cancer types
* Data download : possible to download `.csv` file behind the selection in a view composition

**Interactions**

* *Filter* on theme : cancer types (all, 10 individual), male|female incidence, male|female mortality with national average comparators
* *Linked views* :  bar chart and choropleth map are coupled to support brushing (highlighting)


#### Small Area Health Statistics Unit's e-Atlas

Available at [www.envhealthatlas.co.uk](http://www.envhealthatlas.co.uk/homepage/). Displays relative risk estimates for disease and environmental agents at small area scale (looks like LSOAs).

Additional note : there are some data-related problems I've noticed here -- **base rate fallacy**. It is possible to generate risk ratios for obscure cancers that have extremely low frequency at small area-level -- e.g. the choropleth simply distinguishes presence or absence. Something to consider if we aim at a tool that supports analysis of a user-loaded dataset

<img style="width:80%" src="/images/health_atlas.png" alt="health atlas" />

**Components**

* Choropleth map : displaying risk ratios for E&W
* Dotplot : risk ratios ranked left-to-right (appears only when single LAD is selected)

**Interactions**

* *Slippy map* using [leaflet](https://leafletjs.com) -- e.g. zoom/pan.
* *Filter* on LAD : by clicking on choropleth
* *Linked views* :  dotplot and choropleth map are coupled to support brushing (highlighting), but only in one direction (from choropleth map)

#### Place Survey Explorer

Url no longer supported, but design published in this IJGIS paper: [Slingsby et al. 2014](https://www.tandfonline.com/doi/abs/10.1080/13658816.2014.920845). I could request the application as a `.jar` file for demonstration.

Displays results of large-sample public attitude survey, with results shown thematically and spatially at different levels of aggregation. Paper itself may be useful reference point as discusses design principles and interaction constraints that may be relevant for us.

<img style="width:80%" src="/images/place_survey_all.png" alt="Place survey home view" />

**Components**

* Map : [spatially ordered treemap](https://www.gicentre.net/woodspatially2008) or choropleth (can switch) displaying likert survey responses by theme aggregated to ward? level
* Bar plots left : likert responses by theme with mid-point for county superimposed (purple dot); also superimposed with selected subset (very good health in this case) as bars, but also mid-point for subset (red dot) and entropy measure of variation (red horizontal line)
* Bar plots right : Demographics grouped and with ordering where possible. Optionally rendered as [Spine plots](https://www.stata-journal.com/sjpdf.html?articlenum=gr0031) for relative and absolute comparison.

**Interactions**

* *Filter* on demographic group : by clicking on the right column. I think it is only possible to select a *single* category at a time and notice it is very easy to return to the original, unfiltered state by selecting *everyone*. Also notice the consistent use of visual cues for identifying selection -- saturated red, made possible by the fact that otherwise unsaturated colours are used.

* *Filter* on survey theme/question : by clicking on the left-column. When you do this, the full response set appears (there are many subquestions for each theme) -- see below.

* *Linked views* : probably discussed in the paper, but I think brushing the map, highlights the demographic (right) and attitudinal (left) profile of those living in those areas.

<img style="width:80%" src="/images/place_survey_hierarchy.png" alt="Place survey hierarchy" />

### So, what is an e-Atlas?

* *Linked, multiple views* : rather than simply presenting a map of area-level results there is usually some facility for comparison of spatial *and* non-spatial distributions and for these views to be coupled for filtering and thematic selection.

* *Linked, multiple views **with constraints*** : as distinct from more flexible visualization tools that enable multivariate selection and filtering,  the extent to which these can be used is limited.

* *No computation* : related to above; in some exploratory data visualization tools it is possible for users to generate their own subsets/queries  -- e.g. select records with these characteristics, occurring in this spatial area and temporal window. The examples I've seen do not support this, but we may wish to consider.

* *Lack generalisability* : they're usually designed for specific datasets and tasks. This is probably something to consider for our project -- do we attempt at an e-Atlas that is more generalisable?

* *Public facing*? : important to consider! Are we designing for Turing analysts or for members of the public wishing to explore Turing data -- e.g. from a Citizen Science perspective? Important as this will help further decide on constraints.


### So, what is a Turing e-Atlas?

As we begin discussing/advertising with colleagues at Turing (next month?) we probably need to make some decisions internally on this -- ruling features in and out.

#### Generalisability : no view composition, but possibly user-uploaded data

We clearly will not allow users to do their own view composition (e.g. Tableau), but it may be possible to design a tool (with fixed views) that supports thematically different data, providing it is regularly structured. An example of this is [UpSet](http://caleydo.org/tools/upset/) (very cool and with R package so may use in teaching!).


#### Flexibility : exploration vs. communication

How much exploration do we want to support? How complex do we want to make the querying? Clearly depends on domain, but we probably want pretty hard constraints on this -- and there are technical implications (@Layik, realise these have not been mentioned yet!).

#### Domains/datasets

I mentioned the generalisability issue. Most likely we will choose to design different tools depending on domain -- domain-specific e-Atlas(es).

### Tech (webgl)
Browsers are now capable of rendering graphic intensive and large amounts of datasets. Uber, amonst others, are leading the way to visualize geospatial data in "novel" ways. They have two separate projects which would be useful and source of inspiration. Their "DeckGL" work and "react-vis".

#### Tech stack
As mentioned above it will be "web based", this does not mean it will have to be "online". It means it will be developed using "latest" web technologies but thanks to the advance in this area, we can develop it as a "native" desktop/smartphone application. We will avoid the details in this document on purpose.

We aim to develop an online application. However, for the record, applications which have been developed using this tech stack include Microsoft's VS Code and GitHub's Atom (IDE's), Slack, Rstudio (partly). This means, limitations and security concerns for the "online" version of it can be addressed. 

#### Implementing above ideas
Most of the interactions, components and other aspects of the "prototype" are feasible and achievable. Layik has already worked on STATS19 dataset and developed a basic "interaction dashboard" to explore STATS19 which does include elements from above/below mentioned ideas and work by Roger.

<img style="width:80%" src="https://user-images.githubusercontent.com/408568/66118004-44646f80-e5cd-11e9-98fa-c319c9b42bf3.png" alt="stats19 image"/>

## What is a Turing (geo)visualization toolkit?

A separate activity discussed was in developing design guidelines for supporting visual analysis of Turing data.

Difficult to know quite what we should be doing here. Is this about setting up initiatives at Turing for discussing and sharing InfoVis work? If so, is this something likely to be outside of SPF?  

Could this instead be a more *research-focussed* activity aimed at developing and applying new visualization techniques to analysing SPF datasets specifically - e.g. to support SPF data analysis.



## Planned activity (3 month-plan)

### Jun 2019

* Select domain and dataset for first prototype : RB, NL, LH
* Generate analysis requirements and collect design guidelines : RB
* Prototype 1 design ideas (start) : RB, LH
* Generate slide deck with 'case' / ambition for e-Atlas : RB  

### Jul 2019

* Generate slide deck with 'case' / ambition for e-Atlas : RB
* Present case/ambition for e-Atlas at Turing : RB, NL, LH
* Prototype 1 design ideas : RB, LH

### Aug 2019

* Prototype 1 implemented : RB, LH

## Prototype 1 / making a 'case' : a thought on picking a domain (SPENCER data)


I've previously developed some visualization software (more prototypes) for the crime analysis domain that, interpreted pretty loosely, could be considered as an e-Atlas -- couple of papers and tools.

This work tends to map out the *design space* for developing tools for multi-perspective analysis of recorded crime data -- analysing by geography, time and theme/category, challenges with supporting interaction, how to deal with aggregation, representing uncertainty.  

We could build prototype 1 from this work (though we would need to link with Turing activity) -- or maybe use this when we present a 'case' for e-Atlas to Turing.

* [Beecham et al. 2016](https://www.gicentre.net/favves) : uses containment rather than multiple linked views to represent time, space, theme concurrently

* [Beecham et al. 2015](http://openaccess.city.ac.uk/12331/) : uses standard linked-views but with some interesting ideas that we could consider implementing (set-builder, density-based clustering for zoom dependent aggregation etc., global context for time/space filtering)

