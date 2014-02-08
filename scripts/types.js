/*
 */

function TEventList(obj) {
    return {
	'eid':obj.id,
	'ecreteadBy':obj.createdby,
	'ecreationDateTime':obj.creationDateTime,
	'eDate':obj.endDate,
	'eDateDisplay':obj.endDateDisplay,
	'eContact':obj.eventContact,
	'eDesc':obj.eventDescription,
	'eDistanceFromCity':obj.eventDistanceFromCity,
	'eCarouselPos':obj.carouselPosition,
	'etitle':obj.eventTitle, 
	'eVenue':obj.eventVenue,
	'eFrequecy':obj.frequency,
	'eInCity':obj.inCity,
	'eIsActive':obj.isActive,
	'eIsApproved':obj.isApproved, 
	'eIsBookable':obj.isBookable, 
	'eIsCarousel':obj.isCarouselEvent,
	'eIsClosed':obj.isClosed, 
	'eIsRegistrationClosed':obj.isRegistrationClosed, 
	'eIsRegistrationRequired':obj.isRegistrationRequired, 
	'eLastModifiedDate':obj.lastModifiedDate, 
	'eModifiedBy':obj.modifiedby, 
	'eRemarks':obj.remarks, 
	'eStartDate':obj.startDate,
	'eStartDateDisplay':obj.startDateDisplay,
	'eCategory':obj.eventcategorymaps, 
	'eDocs':obj.eventdocuments, 
	'eImages':obj.eventimages, 
	'eRegDetails':obj.eventregistrationdetails, 
	'eSpnsrDetails':obj.eventsponsordetails, 
	'eRevents':obj.relatedevents,
	'eUser': obj.user,
	'eUserCmnts': obj.usercomments,
	'eCity':obj.city, 
    };
}

function TCategoryList(obj) {
    return {
	'cDesc':obj.categoryDescription,
	'cid':obj.categoryId,
	'cName':obj.categoryName,
	'cParentId':obj.categoryParentId,
	'cCreatedBy':obj.createdby,
	'cCreationDateTime':obj.creationDateTime,
	'cEventCategoryMaps':obj.eventcategorymaps,
	'cLastModifiedDate':obj.lastModifiedDate,
	'cModifiedBy':obj.modifiedby,
	'cRemarks':obj.remarks,
	'cUserCategoryMaps':obj.usercategorymaps,
    };
}

function createEventObjTemplate() {
	return {
		'id' : 100,
		'createdby' : '',
		'creationDateTime' :'',
		'endDate' :'',
		'endDateDisplay' :'',
		'eventContact' :'',
		'eventDescription' :'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
		'eventDistanceFromCity' : 50,
		'carouselPosition' : 0,
		'eventTitle' : 'create amazing activities with urbanbinge.com',
		'eventVenue' : 'bheemeshwari',
		'frequency' : 1 ,
		'inCity' : 1 ,
		'isActive' : 1 ,
		'isApproved' : 0 ,
		'isBookable' : 1 ,
		'isCarouselEvent' : 0 ,
		'isClosed' : 0 ,
		'isRegistrationClosed' : 0 ,
		'isRegistrationRequired' : 1 ,
		'lastModifiedDate' : '',
		'modifiedby' : 'organizer',
		'remarks' : 'summary',
		'startDate' : '01/01/2014',
		'startDateDisplay' : '',
		'eventcategorymaps' : {},
		'eventdocuments' : {'documentURL':'www.google.com','documentName':'documentXLS'}, 
		'eventimages' : {},
		'eventregistrationdetails' : {'perHeadCharge':500,'totalSeats':20},
		'eventsponsordetails' : {},
		'relatedevents' : {},
		'user' : {},
		'usercomments' : {},
		'city' : 'Bangalore',
		'startTime' : '',
		'endTime' : '',
		'facebookEnabled' : 1,
		'twitterEnabled' : 1,
		'linkedinEnabled' : 1,
		'googleplusEnabled' : 1,
		'twitterHashTag' : '#urbanbinge',
		'uri' : 'event',
		'currentPaymentOption' : 1,
	};
}

function sponsorTemplate()
{
	return{
		'event_id' : 1000,
		'name' : 'urbanbinge',
		'image_uri' : '',
		'external_url' : 'http://www.urbanbinge.com',
		'order' : 0
	};
}

function ticketTemplate()
{
	return{
		'name' : 'General Admission',
		'description' : '',
		'type' : 'regular',
		'event_id' : 2000 ,
		'price' : 500,
		'quantity' : 100,
		'quantity_sold' : 0,
		'min_quantity' : 0,
		'max_quantity' : 0,
		'open_date' : '',
		'close_date' : '' ,
		'venue_capacity_value' : 1,
		'order' : 30,
		'show_progress' : true,
		'show_countdown' : false
	};
}